import React from 'react';
import './PremiumCard.css';

const PremiumCard = ({ title, subtitle, icon, children, footer, gradient = false }) => {
  return (
    <div className={`premium-card ${gradient ? 'premium-card-gradient' : ''}`}>
      <div className="premium-card-header">
        {icon && <span className="premium-card-icon">{icon}</span>}
        <div className="premium-card-title-group">
          <h3 className="premium-card-title">{title}</h3>
          {subtitle && <p className="premium-card-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="premium-card-body">
        {children}
      </div>
      {footer && (
        <div className="premium-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PremiumCard;
