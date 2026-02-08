'use server';

import { createClient } from '@/utils/supabase/server';

export async function bulkUploadImages(formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized', results: [] };
    }

    const files = formData.getAll('files') as File[];


    const uploadPromises = files.map(async (file) => {
        try {
            const fileExt = file.name.split('.').pop();
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${uniqueName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                return { fileName: file.name, error: uploadError.message };
            }

            const { data } = supabase.storage.from('products').getPublicUrl(filePath);

            return {
                fileName: file.name,
                url: data.publicUrl
            };

        } catch (error) {
            return { fileName: file.name, error: (error as Error).message || 'Unknown error' };
        }
    });

    const uploadResults = await Promise.all(uploadPromises);

    return { success: true, results: uploadResults };
}
