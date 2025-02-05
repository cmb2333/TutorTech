import React, { useState } from "react";
import { useUser } from "../context/UserContext"; 

const Profile = () => {
  const { user, setUser } = useUser(); 
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    user_id: user.user_id,
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false); // Toggle change password mode
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordMessage, setPasswordMessage] = useState('');


  // Handle input changes
  const informationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes and send to backend
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, ...formData }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser); 
        setIsEditing(false); 
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('An error occurred while updating profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Password updated successfully.');
        setIsEditingPassword(false);
      } else {
        setPasswordMessage(data.message || 'Failed to update password.');
      }
    } catch (error) {
      setPasswordMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Profile</h1>
        
        {isEditing ? (
          <>
            <label>
              First Name:
              <input
                className="inputBox"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={informationChange}
              />
            </label>
            <label>
              Last Name:
              <input
                className="inputBox"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={informationChange}
              />
            </label>
            <label>
              Email:
              <input
                className="inputBox"
                type="email"
                name="email"
                value={formData.email}
                onChange={informationChange}
              />
            </label>
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
            <button className="cancel-button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>Email: {user.email}</p>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        )}
        
        {isEditingPassword ? (
          <div className="password-change-form">
            <label>
              Current Password:
              <input
                className="inputBox"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={passwordChange}
              />
            </label>
            <label>
              New Password:
              <input 
                className="inputBox"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={passwordChange}
              />
            </label>
            <label>
              Confirm New Password:
              <input
                className="inputBox"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={passwordChange}
              />
            </label>
            <button className="save-button" onClick={handlePasswordChange}>
              Save Password
            </button>
            <button
              className="cancel-button"
              onClick={() => setIsEditingPassword(false)}
            >
              Cancel
            </button>
            <p className="password-message">{passwordMessage}</p>
          </div>
        ) : (
          <button
            className="password-button"
            onClick={() => setIsEditingPassword(true)}
          >
            Change Password
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;