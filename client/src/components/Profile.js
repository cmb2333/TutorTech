import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Card, Row, Col } from "react-bootstrap";

const Profile = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

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
      const response = await fetch('${process.env.REACT_APP_API_URL}/update-profile', {
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
      const response = await fetch('${process.env.REACT_APP_API_URL}/change-password', {
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
      <Row className="d-flex align-items-stretch h-100 w-100" style={{ margin: 0 }}>
        <Col md={8} className="d-flex">
          <Card className="profile-card w-100" data-aos="fade-up" data-aos-delay="100">
            <h1>Profile</h1>
            {/* Only show user info when NOT editing or changing password */}
            {!isEditing && !isEditingPassword && (
              <>
                <p>Name: {user.first_name} {user.last_name}</p>
                <p>Email: {user.email}</p>
              </>
            )}
      
            {/* Edit Profile Section */}
            {isEditing ? (
              <div className="edit-information-form">
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
                <br></br>
                <button className="save-button" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="cancel-button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              // Show Edit Profile button only if NOT changing password
              !isEditingPassword && (
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )
            )}
      
            {/* Change Password Section */}
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
                <button className="cancel-button" onClick={() => setIsEditingPassword(false)}>
                  Cancel
                </button>
                <p className="password-message">{passwordMessage}</p>
              </div>
            ) : (
              // Show Change Password button only if NOT editing profile
              !isEditing && (
                <button
                  className="password-button"
                  onClick={() => setIsEditingPassword(true)}
                >
                  Change Password
                </button>
              )
            )}
          </Card>
        </Col>

        <Col md={4} className="d-flex justify-content-center">
          <Card className="profile-avatar flex-grow-1" data-aos="fade-up" data-aos-delay="100">
            <Card.Img
            variant="top"
            src="/assets/louie-icon.png"
            className='profile-img'
            />
            <Card.Body className='text-center'>
                <Card.Title>{user.first_name} {user.last_name}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  
};

export default Profile;