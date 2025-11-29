'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/ui/FileUpload';
import { useBusinessStore } from '@/hooks/useBusiness';
import { api } from '@/lib/api';
import { FolderOpen, Upload, FileText, Image, File as FileIcon, Trash2 } from 'lucide-react';

export default function FilesPage() {
  const { currentBusiness } = useBusinessStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files', currentBusiness?.id],
    queryFn: async () => {
      if (!currentBusiness?.id) return { files: [], pagination: { total: 0 } };
      const response = await api.get(`/businesses/${currentBusiness.id}/files`);
      return response.data.data;
    },
    enabled: !!currentBusiness?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!currentBusiness?.id) throw new Error('No business selected');

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('file', file);
      });

      const response = await api.post(
        `/businesses/${currentBusiness.id}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', currentBusiness?.id] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      if (!currentBusiness?.id) throw new Error('No business selected');
      await api.delete(`/businesses/${currentBusiness.id}/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', currentBusiness?.id] });
    },
  });

  const files = filesData?.files || [];
  const totalSize = files.reduce((sum: number, file: any) => sum + file.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const columns = [
    {
      header: 'File',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          {getFileIcon(row.type)}
          <div>
            <p className="font-medium">{row.originalName}</p>
            <p className="text-xs text-gray-500">{row.mimeType}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Size',
      accessor: (row: any) => {
        const kb = (row.size / 1024).toFixed(2);
        return `${kb} KB`;
      },
    },
    {
      header: 'Uploaded',
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <a
            href={`http://localhost:3001${row.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            View
          </a>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this file?')) {
                deleteMutation.mutate(row.id);
              }
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (!currentBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a business first</p>
        <Button className="mt-4" onClick={() => (window.location.href = '/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-600 mt-1">
            Manage documents and files for your business
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Total Files</p>
          <p className="text-2xl font-bold mt-1">{files.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Storage Used</p>
          <p className="text-2xl font-bold mt-1">{totalSizeMB} MB</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Storage Limit</p>
          <p className="text-2xl font-bold mt-1">10 GB</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${(parseFloat(totalSizeMB) / 10240) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      <Card>
        {files.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload documents, images, and files for your business
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First File
            </Button>
          </div>
        ) : (
          <Table data={files} columns={columns} isLoading={isLoading} />
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Files"
        size="lg"
      >
        <FileUpload
          onUpload={async (files) => {
            // Upload files one by one
            for (const file of files) {
              await uploadMutation.mutateAsync([file]);
            }
          }}
          maxSize={10 * 1024 * 1024} // 10MB
          multiple={true}
        />
      </Modal>
    </div>
  );
}
