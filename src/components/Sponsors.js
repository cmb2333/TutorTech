import React from 'react';

function Sponsors() {
  const sponsors = [
    { name: 'Dr. Andy Wang', img: '/assets/andywang.jpg', title: 'Professor & Director, MRTL' },
    { name: 'Sethuprasad Gorantla', img: '/assets/seth.jpg', title: 'Program Assistant Manager, MRTL' },
  ];

  return (
    <section className="section-team-information">
      <h2>Our Sponsors</h2>
      <div className="team-cards">
        {sponsors.map((sponsor, index) => (
          <div key={index} className="team-card">
            <img src={sponsor.img} alt={`${sponsor.name}'s profile`} className="team-img" />
            <h3>{sponsor.name}</h3>
            <p>{sponsor.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Sponsors;

