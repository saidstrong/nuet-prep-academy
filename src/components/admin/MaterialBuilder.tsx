'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, X, FileText, Link, Upload, Video, Type, Edit2 } from 'lucide-react';

interface MaterialBlock {
  id: string;
  type: 'text' | 'link' | 'file' | 'youtube';
  content: string;
  label?: string;
  file?: File;
  videoId?: string;
}

interface Material {
  id: string;
  name: string;
  blocks: MaterialBlock[];
}

interface MaterialBuilderProps {
  material?: Material;
  topicId: string;
  subtopicId?: string;
  onClose: () => void;
  onSave: (material: Material) => void;
}

export default function MaterialBuilder({ material, topicId, subtopicId, onClose, onSave }: MaterialBuilderProps) {
  const [materialData, setMaterialData] = useState<Material>(material || {
    id: `material-${Date.now()}`,
    name: 'New Material',
    blocks: []
  });

  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [newBlockType, setNewBlockType] = useState<'text' | 'link' | 'file' | 'youtube'>('text');
  const [newBlockContent, setNewBlockContent] = useState('');
  const [newBlockLabel, setNewBlockLabel] = useState('');
  const [newBlockFile, setNewBlockFile] = useState<File | null>(null);

  const addBlock = () => {
    if (!newBlockContent.trim() && newBlockType !== 'file') return;

    const newBlock: MaterialBlock = {
      id: `block-${Date.now()}`,
      type: newBlockType,
      content: newBlockContent.trim(),
      label: newBlockLabel.trim() || undefined,
      file: newBlockFile || undefined,
      videoId: newBlockType === 'youtube' ? extractVideoId(newBlockContent) : undefined
    };

    setMaterialData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));

    // Reset form
    setNewBlockContent('');
    setNewBlockLabel('');
    setNewBlockFile(null);
    setEditingBlock(null);
  };

  const updateBlock = (blockId: string, updates: Partial<MaterialBlock>) => {
    setMaterialData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    }));
  };

  const deleteBlock = (blockId: string) => {
    setMaterialData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setMaterialData(prev => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex(block => block.id === blockId);
      
      if (direction === 'up' && index > 0) {
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else if (direction === 'down' && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }
      
      return { ...prev, blocks };
    });
  };

  const extractVideoId = (url: string): string | undefined => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : undefined;
  };

  const handleSave = () => {
    if (!materialData.name.trim()) {
      alert('Please enter a material name');
      return;
    }

    onSave(materialData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewBlockFile(file);
      setNewBlockContent(file.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <input
              type="text"
              value={materialData.name}
              onChange={(e) => setMaterialData(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-semibold bg-transparent border-none outline-none w-full"
              placeholder="Enter material name"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Material
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Blocks List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Blocks ({materialData.blocks.length})</h3>
              
              {/* Add Block Button */}
              <button
                onClick={() => setEditingBlock('new')}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors mb-4"
              >
                <Plus className="w-5 h-5 mx-auto mb-2" />
                Add Content Block
              </button>

              {/* New Block Form */}
              {editingBlock === 'new' && (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Block Type *
                      </label>
                      <select
                        value={newBlockType}
                        onChange={(e) => {
                          setNewBlockType(e.target.value as any);
                          setNewBlockContent('');
                          setNewBlockLabel('');
                          setNewBlockFile(null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="text">Text</option>
                        <option value="link">Link</option>
                        <option value="file">File Upload</option>
                        <option value="youtube">YouTube Video</option>
                      </select>
                    </div>

                    {newBlockType === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Text Content *
                        </label>
                        <textarea
                          value={newBlockContent}
                          onChange={(e) => setNewBlockContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                          placeholder="Enter your text content (supports markdown)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Supports markdown formatting
                        </p>
                      </div>
                    )}

                    {newBlockType === 'link' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL *
                          </label>
                          <input
                            type="url"
                            value={newBlockContent}
                            onChange={(e) => setNewBlockContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link Label (optional)
                          </label>
                          <input
                            type="text"
                            value={newBlockLabel}
                            onChange={(e) => setNewBlockLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Click here to visit..."
                          />
                        </div>
                      </div>
                    )}

                    {newBlockType === 'file' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Upload *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                          >
                            Choose file or drag and drop
                          </label>
                          {newBlockFile && (
                            <p className="text-sm text-gray-600 mt-2">
                              Selected: {newBlockFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {newBlockType === 'youtube' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          YouTube URL *
                        </label>
                        <input
                          type="url"
                          value={newBlockContent}
                          onChange={(e) => setNewBlockContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Paste any YouTube URL (watch, embed, or youtu.be)
                        </p>
                        {newBlockContent && extractVideoId(newBlockContent) && (
                          <div className="mt-3">
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Video ID: {extractVideoId(newBlockContent)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setEditingBlock(null);
                          setNewBlockContent('');
                          setNewBlockLabel('');
                          setNewBlockFile(null);
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addBlock}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Block
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Blocks List */}
              <div className="space-y-3">
                {materialData.blocks.map((block, index) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    index={index}
                    totalBlocks={materialData.blocks.length}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onMove={moveBlock}
                  />
                ))}
              </div>

              {materialData.blocks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content blocks yet. Click "Add Content Block" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="space-y-4">
              {materialData.blocks.map((block, index) => (
                <BlockPreview key={block.id} block={block} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Block Card Component
interface BlockCardProps {
  block: MaterialBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (blockId: string, updates: Partial<MaterialBlock>) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, direction: 'up' | 'down') => void;
}

function BlockCard({ block, index, totalBlocks, onUpdate, onDelete, onMove }: BlockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content);
  const [editLabel, setEditLabel] = useState(block.label || '');

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(block.id, { 
        content: editContent.trim(),
        label: editLabel.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      case 'file': return <Upload className="w-4 h-4" />;
      case 'youtube': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getBlockTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Text';
      case 'link': return 'Link';
      case 'file': return 'File';
      case 'youtube': return 'YouTube';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMove(block.id, 'up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(block.id, 'down')}
            disabled={index === totalBlocks - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            {getBlockIcon(block.type)}
            <span className="text-sm font-medium text-gray-500">
              {getBlockTypeLabel(block.type)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {block.type === 'text' && (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              autoFocus
            />
          )}
          
          {(block.type === 'link' || block.type === 'youtube') && (
            <div className="space-y-2">
              <input
                type="url"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter URL"
              />
              {block.type === 'link' && (
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Link label (optional)"
                />
              )}
            </div>
          )}

          {block.type === 'file' && (
            <div className="text-sm text-gray-600">
              File: {block.file?.name || 'No file selected'}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(block.content);
                setEditLabel(block.label || '');
              }}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          {block.type === 'text' && (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {block.content.substring(0, 100)}
              {block.content.length > 100 && '...'}
            </div>
          )}
          
          {block.type === 'link' && (
            <div className="text-sm">
              <a href={block.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                {block.label || block.content}
              </a>
            </div>
          )}

          {block.type === 'file' && (
            <div className="text-sm text-gray-700">
              📎 {block.file?.name || 'File'}
            </div>
          )}

          {block.type === 'youtube' && (
            <div className="text-sm text-gray-700">
              🎥 YouTube Video
              {block.videoId && (
                <span className="text-xs text-gray-500 ml-2">
                  (ID: {block.videoId})
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Block Preview Component
function BlockPreview({ block, index }: { block: MaterialBlock; index: number }) {
  const extractVideoId = (url: string): string | undefined => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : undefined;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm font-medium text-gray-500">Block {index + 1}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500 capitalize">{block.type}</span>
      </div>

      {block.type === 'text' && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm text-gray-700">
            {block.content}
          </div>
        </div>
      )}

      {block.type === 'link' && (
        <div>
          <a 
            href={block.content} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {block.label || block.content}
          </a>
        </div>
      )}

      {block.type === 'file' && (
        <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
          <Upload className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {block.file?.name || 'File'}
          </span>
        </div>
      )}

      {block.type === 'youtube' && (
        <div>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">
            YouTube Video
            {block.videoId && ` (${block.videoId})`}
          </p>
        </div>
      )}
    </div>
  );
}
