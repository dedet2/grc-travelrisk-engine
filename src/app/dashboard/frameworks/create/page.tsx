'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Control {
  id: string;
  title: string;
  description: string;
  weight?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  controls: Control[];
}

interface FrameworkData {
  name: string;
  version: string;
  description: string;
  standardBody?: string;
  categories: Category[];
  status: 'draft' | 'published';
}

export default function CreateFrameworkPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [framework, setFramework] = useState<FrameworkData>({
    name: '',
    version: '1.0.0',
    description: '',
    standardBody: '',
    categories: [],
    status: 'draft',
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });

  const [newControl, setNewControl] = useState({
    categoryId: '',
    title: '',
    description: '',
    weight: 1,
  });

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Step 1: Framework Basics
  const handleBasicsChange = (field: string, value: string) => {
    setFramework((prev) => ({ ...prev, [field]: value }));
  };

  // Step 2: Add Category
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    const categoryId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setFramework((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: categoryId,
          name: newCategory.name,
          description: newCategory.description,
          controls: [],
        },
      ],
    }));

    setNewCategory({ name: '', description: '' });
    setError(null);
  };

  // Step 3: Add Control
  const handleAddControl = () => {
    if (!newControl.categoryId || !newControl.title.trim()) {
      setError('Category and control title are required');
      return;
    }

    const controlId = `ctrl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setFramework((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id === newControl.categoryId) {
          return {
            ...cat,
            controls: [
              ...cat.controls,
              {
                id: controlId,
                title: newControl.title,
                description: newControl.description,
                weight: newControl.weight,
              },
            ],
          };
        }
        return cat;
      }),
    }));

    setNewControl({
      categoryId: '',
      title: '',
      description: '',
      weight: 1,
    });
    setError(null);
  };

  // Remove control
  const handleRemoveControl = (categoryId: string, controlId: string) => {
    setFramework((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            controls: cat.controls.filter((c) => c.id !== controlId),
          };
        }
        return cat;
      }),
    }));
  };

  // Remove category
  const handleRemoveCategory = (categoryId: string) => {
    setFramework((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }));
  };

  // Save framework
  const handleSaveFramework = async (publishNow: boolean) => {
    try {
      setSaving(true);
      setError(null);

      // Validate framework
      if (!framework.name.trim() || !framework.version.trim()) {
        throw new Error('Framework name and version are required');
      }

      if (framework.categories.length === 0) {
        throw new Error('Add at least one category to the framework');
      }

      // Prepare controls array
      const controls = framework.categories.flatMap((cat) =>
        cat.controls.map((ctrl) => ({
          id: ctrl.id,
          title: ctrl.title,
          description: ctrl.description,
          category: cat.name,
          controlType: 'management',
          weight: ctrl.weight || 1,
        }))
      );

      const response = await fetch('/api/frameworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: framework.name,
          version: framework.version,
          description: framework.description,
          status: publishNow ? 'published' : 'draft',
          controls,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save framework');
      }

      const result = await response.json();
      router.push(`/dashboard/frameworks?success=${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save framework');
      setSaving(false);
    }
  };

  const totalControls = framework.categories.reduce(
    (sum, cat) => sum + cat.controls.length,
    0
  );

  const steps = [
    { number: 1, title: 'Basics' },
    { number: 2, title: 'Categories' },
    { number: 3, title: 'Controls' },
    { number: 4, title: 'Review' },
    { number: 5, title: 'Save' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Create Custom Framework</h1>
        <p className="text-gray-600 mt-2">Build a custom GRC framework tailored to your organization</p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 mx-2 transition-colors ${
                    currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  style={{ width: '100%' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Framework Basics */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Framework Basics</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework Name
            </label>
            <input
              type="text"
              value={framework.name}
              onChange={(e) => handleBasicsChange('name', e.target.value)}
              placeholder="e.g., Enterprise Security Controls"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                value={framework.version}
                onChange={(e) => handleBasicsChange('version', e.target.value)}
                placeholder="e.g., 1.0.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Body (Optional)
              </label>
              <input
                type="text"
                value={framework.standardBody || ''}
                onChange={(e) => handleBasicsChange('standardBody', e.target.value)}
                placeholder="e.g., NIST, ISO 27001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={framework.description}
              onChange={(e) => handleBasicsChange('description', e.target.value)}
              placeholder="Describe the purpose and scope of this framework"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => router.push('/dashboard/frameworks')}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!framework.name.trim() || !framework.version.trim()) {
                  setError('Framework name and version are required');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next: Add Categories
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Categories */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Categories</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Categories organize controls into logical groups (e.g., Access Control, Data Protection)
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Access Control"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe this category"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleAddCategory}
              className="w-full px-4 py-2 border-2 border-dashed border-indigo-300 text-indigo-600 font-medium rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              + Add Category
            </button>
          </div>

          {/* Listed Categories */}
          {framework.categories.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900">Categories ({framework.categories.length})</h3>
              {framework.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCategory(category.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between space-x-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (framework.categories.length === 0) {
                  setError('Add at least one category');
                  return;
                }
                setCurrentStep(3);
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next: Add Controls
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Controls */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Controls</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Controls are specific requirements or measures within each category. You have {totalControls} control(s) so far.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newControl.categoryId}
                onChange={(e) =>
                  setNewControl((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {framework.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Title
              </label>
              <input
                type="text"
                value={newControl.title}
                onChange={(e) =>
                  setNewControl((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., User Authentication"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newControl.description}
                onChange={(e) =>
                  setNewControl((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe this control"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={newControl.weight}
                onChange={(e) =>
                  setNewControl((prev) => ({
                    ...prev,
                    weight: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleAddControl}
              className="w-full px-4 py-2 border-2 border-dashed border-indigo-300 text-indigo-600 font-medium rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              + Add Control
            </button>
          </div>

          {/* Listed Controls */}
          {totalControls > 0 && (
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900">Controls ({totalControls})</h3>
              {framework.categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  {category.controls.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium text-gray-700 text-indigo-600">
                        {category.name}
                      </h4>
                      {category.controls.map((control) => (
                        <div
                          key={control.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{control.title}</p>
                            {control.description && (
                              <p className="text-sm text-gray-600 mt-1">{control.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveControl(category.id, control.id)
                            }
                            className="text-red-600 hover:text-red-700 font-medium text-sm ml-4"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between space-x-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Framework</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Framework Name</p>
              <p className="text-lg font-bold text-gray-900">{framework.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Version</p>
              <p className="text-lg font-bold text-gray-900">{framework.version}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Categories</p>
              <p className="text-lg font-bold text-gray-900">{framework.categories.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Controls</p>
              <p className="text-lg font-bold text-gray-900">{totalControls}</p>
            </div>
          </div>

          {framework.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{framework.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Framework Structure</h3>
            {framework.categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
                <div className="mt-3 space-y-2">
                  {category.controls.map((control) => (
                    <div key={control.id} className="bg-gray-50 rounded p-2 text-sm">
                      <p className="font-medium text-gray-900">{control.title}</p>
                      {control.description && (
                        <p className="text-xs text-gray-600 mt-1">{control.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between space-x-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next: Save
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Save */}
      {currentStep === 5 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Save Framework</h2>

          <div className="space-y-4">
            <div
              onClick={() => setFramework((prev) => ({ ...prev, status: 'draft' }))}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                framework.status === 'draft'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                    framework.status === 'draft'
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}
                />
                <div>
                  <h4 className="font-bold text-gray-900">Save as Draft</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Save your framework and continue editing later
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setFramework((prev) => ({ ...prev, status: 'published' }))}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                framework.status === 'published'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                    framework.status === 'published'
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}
                />
                <div>
                  <h4 className="font-bold text-gray-900">Publish Now</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Publish and make available for assessments
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => handleSaveFramework(framework.status === 'published')}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : framework.status === 'published' ? 'Publish Framework' : 'Save Draft'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
