import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, fetchCategories } from '../services/api';
import Button from '../components/Button';
import './CreateListingPage.css';

const CreateListingPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(res => setCategories(res.data));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    setLoading(true);
    setError('');

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });
    images.forEach(image => {
      submissionData.append('uploaded_images', image);
    });

    try {
      const response = await createListing(submissionData);
      // Redirect to the new listing's detail page
      navigate(`/listings/${response.data.id}`);
    } catch (err) {
      setError('Failed to create listing. Please check your inputs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container create-listing-page">
      <h1>Post a New Ad</h1>
      <form onSubmit={handleSubmit} className="listing-form">
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" onChange={handleInputChange} required>
            <option value="">Select a Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Price (CFA)</label>
          <input type="number" name="price" onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" placeholder="e.g., Ouagadougou" onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" rows="6" onChange={handleInputChange} required></textarea>
        </div>

        <div className="form-group">
          <label>Upload Images (up to 5)</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} required />
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Post Your Ad'}
        </Button>
      </form>
    </div>
  );
};

export default CreateListingPage;