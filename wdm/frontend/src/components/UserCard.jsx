const UserCard = ({ user, isSelected, onSelect, isAdmin = false }) => {
  const itemsWithPrice = user.items.filter(item => item.price && !isNaN(parseFloat(item.price)));
  const totalValue = itemsWithPrice.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const getSocialStatusColor = (status) => {
    switch (status) {
      case 'Budget-Conscious': return '#10b981';
      case 'Middle Class': return '#3b82f6';
      case 'Upper Middle Class': return '#8b5cf6';
      case 'Affluent': return '#f59e0b';
      case 'High Net Worth': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const cardStyle = {
    padding: "0.75rem",
    marginBottom: "0.5rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    ...(isAdmin ? {
      border: isSelected ? "2px solid #dc2626" : "1px solid #fecaca",
      backgroundColor: isSelected ? "#fef2f2" : "#fff5f5",
      borderLeft: "3px solid #dc2626"
    } : {
      border: isSelected ? "2px solid #8b5cf6" : "1px solid #e5e7eb",
      backgroundColor: isSelected ? "#f3f0ff" : "white",
    })
  };

  return (
    <div style={cardStyle} onClick={() => onSelect(user.id)}>
      <div style={{ 
        fontWeight: isAdmin ? "600" : "500", 
        fontSize: "0.875rem", 
        marginBottom: "0.25rem", 
        color: isAdmin ? "#991b1b" : "#111827" 
      }}>
        {isAdmin && "👑 "}{user.name}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
        {user.items.length} items • ${totalValue.toFixed(0)}
      </div>
      {itemsWithPrice.length > 0 && (
        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
          Avg: ${(totalValue / itemsWithPrice.length).toFixed(0)}
        </div>
      )}
      
      {isAdmin && (
        <div style={{
          fontSize: "0.7rem",
          fontWeight: "600",
          color: "white",
          backgroundColor: "#dc2626",
          padding: "0.2rem 0.5rem",
          borderRadius: "0.25rem",
          display: "inline-block",
          marginTop: "0.25rem"
        }}>
          ADMIN
        </div>
      )}
      
      {!isAdmin && user.priceStats?.socialStatus && (
        <div style={{
          fontSize: "0.75rem",
          fontWeight: "500",
          color: user.priceStats.socialStatus === 'No Data' ? "#6b7280" : "white",
          backgroundColor: user.priceStats.socialStatus === 'No Data' ? "#f3f4f6" : getSocialStatusColor(user.priceStats.socialStatus),
          padding: "0.25rem 0.5rem",
          borderRadius: "0.25rem",
          display: "inline-block",
          marginTop: "0.25rem"
        }}>
          {user.priceStats.socialStatus}
        </div>
      )}
    </div>
  );
};

export default UserCard;