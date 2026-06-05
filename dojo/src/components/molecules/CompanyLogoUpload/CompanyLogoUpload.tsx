import React, { useState, useEffect } from 'react';
import { Upload, Edit3, Trash2, Building, Image, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Logo {
  id: number;
  name: string;
  logo: string;
  uploaded_at: string;
}

const CompanyLogoUpload: React.FC = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    logo: null as File | null
  });
  const [logos, setLogos] = useState<Logo[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/logos/');
        if (response.ok) {
          const data = await response.json();
          setLogos(data);
          // If there's a logo, automatically set edit mode for the first logo
          if (data.length > 0) {
            handleEdit(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching logos:', error);
        setErrorMessage('Failed to fetch logos. Please try again.');
      }
    };

    fetchLogos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter a company name');
      setLoading(false);
      return;
    }

    if (!formData.logo && !isEditing) {
      setErrorMessage('Please select a logo file');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    if (formData.logo) {
      data.append('logo', formData.logo);
    }

    try {
      const url = isEditing 
        ? `http://127.0.0.1:8000/logos/${formData.id}/`
        : 'http://127.0.0.1:8000/logos/';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'upload'} logo`);
      }
      
      setSuccessMessage(`Logo ${isEditing ? 'updated' : 'uploaded'} successfully!`);
      resetForm();
      
      // Refresh logos list
      const logosResponse = await fetch('http://127.0.0.1:8000/logos/');
      if (logosResponse.ok) {
        const logosData = await logosResponse.json();
        setLogos(logosData);
        // If we were editing and still have logos, keep in edit mode
        if (logosData.length > 0) {
          handleEdit(logosData[0]);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage(error.message || `Failed to ${isEditing ? 'update' : 'upload'} logo. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      logo: null
    });
    setIsEditing(false);
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (logo: Logo) => {
    setFormData({
      id: logo.id.toString(),
      name: logo.name,
      logo: null
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this logo?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/logos/${id}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete logo');
        }

        setLogos(logos.filter(logo => logo.id !== id));
        setSuccessMessage('Logo deleted successfully!');
        resetForm();
      } catch (error) {
        console.error('Error deleting logo:', error);
        setErrorMessage('Failed to delete logo. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-blue-400 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {logos.length > 0 ? 'Company Logo Management' : 'Upload Company Logo'}
            </h3>
            <p className="text-sm text-gray-600">Manage your organization's brand identity</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Success</p>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-500 hover:text-green-700 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload/Edit Form */}
        {(logos.length === 0 || isEditing) && (
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isEditing ? 'New Logo File (Optional)' : 'Logo File *'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <Image className="w-4 h-4 mr-1 flex-shrink-0" />
                  Supported formats: JPG, PNG, GIF, SVG (Max 5MB)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-400 to-slate-400 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{isEditing ? 'Updating...' : 'Uploading...'}</span>
                    </>
                  ) : (
                    <>
                      {isEditing ? <Edit3 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      <span>{isEditing ? 'Update Logo' : 'Upload Logo'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Logo Display */}
        {logos.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Building className="w-5 h-5 mr-2 text-slate-400" />
              Current Company Logo
            </h4>
            <div className="grid grid-cols-1 gap-6">
              {logos.map((logo) => (
                <div key={logo.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-2 shadow-sm mx-auto sm:mx-0">
                        <img 
                          src={logo.logo}
                          alt={logo.name} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-center sm:text-left">
                        <h5 className="text-lg font-semibold text-gray-900">{logo.name}</h5>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploaded: {new Date(logo.uploaded_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => handleEdit(logo)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(logo.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {logos.length === 0 && !isEditing && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-gray-500 text-lg">No company logo uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload your first logo to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GeneralSettingsMethod: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-400 to-blue-400 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">General Settings</h1>
              <p className="text-gray-600 mt-1">Configure your organization's core settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Company Logo Section */}
          <CompanyLogoUpload />
          
          {/* Future Settings Sections */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More Settings Coming Soon</h3>
              <p className="text-gray-500">Additional configuration options will be available here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsMethod;