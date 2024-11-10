import React from 'react';

function Team() {
  const teamMembers = [
    { name: 'Chase Babb', img: '/assets/Chase.jpg', bio: 'Bio' },
    { name: 'Ryley Fernandez', img: '/assets/Ryley.png', bio: 'Bio' },
    { name: 'Faith Ononye', img: '/assets/Faith.jpg', bio: 'Bio' },
    { name: 'Shurie Kamewada', img: '/assets/Shurie.png', bio: 'Bio' },
  ];

  return (
    <section className="section-team-information">
      <h2>Meet the Team</h2>
      <div className="team-cards">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <img src={member.img} alt={`${member.name}'s profile`} className="team-img" />
            <h3>{member.name}</h3>
            <p>{member.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Team;
