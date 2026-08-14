import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid Supabase configuration is provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Compresses an image file in the browser using HTML5 Canvas
 * @param {File} file 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @param {number} quality (0.0 to 1.0)
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    // If SVG or GIF, don't compress via canvas to preserve vector/animation
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        const outputType = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // fallback to original if blob creation fails
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads an image to Supabase Storage Bucket ('travel-images')
 * If Supabase is not configured, automatically converts to Base64 Data URL for offline/local storage.
 * @param {File} file
 * @returns {Promise<{ url: string, isLocal: boolean, warning?: string }>}
 */
export async function uploadImage(file) {
  if (!file) throw new Error('업로드할 파일이 없습니다.');

  try {
    // 1. Client-side Image compression
    const compressedBlob = await compressImage(file);

    // 2. If Supabase is configured, upload to Supabase Storage
    if (isSupabaseConfigured && supabase) {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('travel-images')
        .upload(filePath, compressedBlob, {
          contentType: compressedBlob.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Storage Upload Error:', uploadError);
        throw new Error(`스토리지 업로드 실패: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('travel-images')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        isLocal: false
      };
    } else {
      // Fallback: Convert to Base64 Data URL for local use
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedBlob);
        reader.onloadend = () => {
          resolve({
            url: reader.result,
            isLocal: true,
            warning: 'Supabase가 아직 연결되지 않아 로컬 브라우저에 임시 저장되었습니다.'
          });
        };
      });
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

/**
 * Fetch all posts from Supabase DB
 */
export async function fetchPostsFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase posts fetch warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map DB column names back to frontend object structure
    return data.map(item => ({
      id: item.id,
      title: item.title,
      location: item.location,
      tripType: item.trip_type || 'single',
      startDate: item.start_date,
      endDate: item.end_date,
      date: item.date,
      durationText: item.duration_text,
      mainImage: item.main_image,
      summary: item.summary || '',
      blocks: Array.isArray(item.blocks) ? item.blocks : (typeof item.blocks === 'string' ? JSON.parse(item.blocks) : []),
      createdAt: item.created_at
    }));
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
}

/**
 * Upsert (Create or Update) post in Supabase
 */
export async function savePostToSupabase(post) {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const record = {
      id: String(post.id),
      title: post.title,
      location: post.location,
      trip_type: post.tripType,
      start_date: post.startDate,
      end_date: post.endDate,
      date: post.date,
      duration_text: post.durationText || '',
      main_image: post.mainImage,
      summary: post.summary || '',
      blocks: post.blocks || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('posts')
      .upsert(record);

    if (error) {
      console.error('Supabase save post error:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Save post to Supabase failed:', err);
    throw err;
  }
}

/**
 * Delete post from Supabase
 */
export async function deletePostFromSupabase(postId) {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', String(postId));

    if (error) {
      console.error('Supabase delete post error:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Delete post from Supabase failed:', err);
    throw err;
  }
}
