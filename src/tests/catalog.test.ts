import { describe, it, expect, vi } from 'vitest';
import { uploadCatalog, deleteCatalog } from '../app/actions/catalog';

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file.pdf' } }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) }),
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }),
    }),
  }),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Catalog Actions', () => {
  it('should upload a catalog successfully', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Catalog');
    formData.append('description', 'Test Description');
    formData.append('category', 'General');
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const result = await uploadCatalog(formData);
    expect(result.success).toBe(true);
  });

  it('should fail if required fields are missing', async () => {
    const formData = new FormData();
    // Missing file and title
    
    const result = await uploadCatalog(formData);
    expect(result.error).toBe('Missing required fields');
  });

  it('should delete a catalog successfully', async () => {
    const result = await deleteCatalog('test-id', 'https://test.com/catalogs/test-user/file.pdf');
    expect(result.success).toBe(true);
  });
});
