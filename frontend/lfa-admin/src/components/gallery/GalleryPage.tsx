'use client';

import React, { useEffect, useState } from 'react';
import useGallery from '../../hooks/useGallery';
import { CreateGalleryDto, Gallery, GalleryCategory } from '../../types/gallery.types';

const GalleryPage = () => {
  const {
    galleries,
    categories,
    loading,
    error,
    pagination,
    loadGalleries,
    addGallery,
    removeGallery,
    clearGalleryError,
  } = useGallery();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateGalleryDto>({
    title: '',
    category: '',
    description: '',
    image: undefined,
  });

  useEffect(() => {
    loadGalleries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGallery(formData);
      setFormData({ title: '', category: '', description: '', image: undefined });
      setShowForm(false);
      loadGalleries(); // Refresh the list
    } catch (error) {
      console.error('Failed to create gallery:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await removeGallery(id);
        loadGalleries(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete gallery:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={clearGalleryError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Gallery Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category: GalleryCategory) => (
                  <option key={category.key} value={category.key}>
                    {category.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm && (
        <div className="text-center py-4">Loading galleries...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery: Gallery) => (
          <div key={gallery._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {gallery.image && (
              <img
                src={gallery.image}
                alt={gallery.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{gallery.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Category: {categories.find((c: GalleryCategory) => c.key === gallery.category)?.value || gallery.category}
              </p>
              {gallery.description && (
                <p className="text-gray-700 mb-4">{gallery.description}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleDelete(gallery._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {galleries.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No gallery items found. Create your first item!
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => loadGalleries({ ...pagination, page })}
                className={`px-3 py-1 rounded ${
                  page === pagination.currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
