import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateAccount.css'; // We'll create this CSS file
import Navbar from '../../../landing/components/Navbar';
import { createRepositoryAuthor } from "../../../api/repository_api";
function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    phone: '',
    academicAffiliation: '',
    department: '',
    researchInterest: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const countries = [
    'Select Country',
    'Ethiopia',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Kenya',
    'South Africa',
    'Nigeria',
    'Uganda',
    'Tanzania',
    'Rwanda',
    'Sudan',
    'Egypt',
    'Italy',
    'Sweden',
    'Norway',
    'Netherlands'
  ];

  const researchInterests = [
    'Oromo Literature',
    'Cultural Studies',
    'History',
    'Linguistics',
    'Anthropology',
    'Sociology',
    'Political Science',
    'Education',
    'Religious Studies',
    'Gender Studies',
    'Environmental Studies',
    'Economics',
    'Public Health',
    'Technology',
    'Art & Music',
    'Philosophy'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Full name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    // Country validation
    if (!formData.country || formData.country === 'Select Country') {
      newErrors.country = 'Please select your country';
    }

    // Phone validation (optional but with format check if provided)
    if (formData.phone && !/^[+]?[\d\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (8-15 digits)';
    }

    // Academic Affiliation validation
    if (!formData.academicAffiliation.trim()) {
      newErrors.academicAffiliation = 'Academic affiliation is required';
    } else if (formData.academicAffiliation.trim().length < 3) {
      newErrors.academicAffiliation = 'Please enter a valid institution name';
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    // Research Interest validation
    if (!formData.researchInterest) {
      newErrors.researchInterest = 'Please select your research interest';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setIsLoading(true);

  try {
    // ✅ Send data to backend
    await createRepositoryAuthor(formData);

    alert("Account created successfully!");

    navigate("/auth");

  } catch (error) {
    console.error("Registration error:", error);

    setErrors({
      submit:
        error.response?.data?.message ||
        "Registration failed. Please try again."
    });
  } finally {
    setIsLoading(false);
  }
};

  return ( 
    <>
    <Navbar />
    <div className="create-account-container">
      <div className="create-account-wrapper">
        <div className="create-account-header">
          <h1>Create Researcher Account</h1>
          <p>Join our community of scholars and researchers</p>
        </div>

        <form onSubmit={handleSubmit} className="create-account-form">
          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Dr. Tsegaye Gebre"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="researcher@university.edu"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Country and Phone Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">
                Country <span className="required">*</span>
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              >
                {countries.map((country, index) => (
                  <option key={index} value={country === 'Select Country' ? '' : country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251-911-234-567"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          {/* Academic Affiliation */}
          <div className="form-group">
            <label htmlFor="academicAffiliation">
              Academic Affiliation <span className="required">*</span>
            </label>
            <input
              type="text"
              id="academicAffiliation"
              name="academicAffiliation"
              value={formData.academicAffiliation}
              onChange={handleChange}
              placeholder="Addis Ababa University"
              className={errors.academicAffiliation ? 'error' : ''}
            />
            {errors.academicAffiliation && <span className="error-message">{errors.academicAffiliation}</span>}
          </div>

          {/* Department */}
          <div className="form-group">
            <label htmlFor="department">
              Department <span className="required">*</span>
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Department of Oromo Literature"
              className={errors.department ? 'error' : ''}
            />
            {errors.department && <span className="error-message">{errors.department}</span>}
          </div>

          {/* Research Interest */}
          <div className="form-group">
            <label htmlFor="researchInterest">
              Research Interest <span className="required">*</span>
            </label>
            <select
              id="researchInterest"
              name="researchInterest"
              value={formData.researchInterest}
              onChange={handleChange}
              className={errors.researchInterest ? 'error' : ''}
            >
              <option value="">Select your primary research interest</option>
              {researchInterests.map((interest, index) => (
                <option key={index} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
            {errors.researchInterest && <span className="error-message">{errors.researchInterest}</span>}
          </div>

          {/* Password Fields Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
              <small className="password-hint">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
                <span className="required">*</span>
              </span>
            </label>
            {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="login-link">
            Already have an account? <Link to="/auth">Sign in here</Link>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default CreateAccount;