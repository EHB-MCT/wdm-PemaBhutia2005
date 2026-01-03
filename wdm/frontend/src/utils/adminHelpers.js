export const getSocialStatusColor = (status) => {
  switch (status) {
    case 'Budget-Conscious': return '#10b981';
    case 'Middle Class': return '#3b82f6';
    case 'Upper Middle Class': return '#8b5cf6';
    case 'Affluent': return '#f59e0b';
    case 'High Net Worth': return '#dc2626';
    default: return '#6b7280';
  }
};

export const filterUsersByEconomicStatus = (users, filter) => {
  if (filter === "All") return users;
  return users.filter(user => 
    user.priceStats?.socialStatus === filter
  );
};

export const calculateUserStats = (users, selectedUserId = null) => {
  const relevantUsers = selectedUserId 
    ? users.filter(u => u.id === selectedUserId)
    : users;
  
  const totalUsers = selectedUserId ? 1 : users.length;
  const totalItems = relevantUsers.reduce((sum, user) => sum + user.items.length, 0);
  const itemsWithGPS = relevantUsers.reduce((sum, user) => 
    sum + user.items.filter(item => item.gps_lat && item.gps_lon).length, 0
  );
  
  const usersWithValidItems = relevantUsers.filter(user => {
    const validPrices = user.items.filter(item => item.price && !isNaN(parseFloat(item.price)));
    return validPrices.length > 0;
  });
  
  let avgItemPrice = '0.0';
  if (usersWithValidItems.length > 0) {
    const totalAverage = usersWithValidItems.reduce((sum, user) => {
      const validPrices = user.items.filter(item => item.price && !isNaN(parseFloat(item.price)));
      if (validPrices.length === 0) return sum;
      const userAvg = validPrices.reduce((itemSum, item) => itemSum + parseFloat(item.price), 0) / validPrices.length;
      return sum + userAvg;
    }, 0);
    avgItemPrice = (totalAverage / usersWithValidItems.length).toFixed(1);
  }
  
  return {
    totalUsers,
    totalItems,
    itemsWithGPS,
    avgItemPrice
  };
};

export const getBubbleChartData = (users, selectedUserId = null) => {
  const filteredUsers = selectedUserId 
    ? users.filter(user => user.id === selectedUserId)
    : users;
  
  const bubbleData = filteredUsers.map(user => {
    const items = user.items.filter(item => item.price && !isNaN(parseFloat(item.price)));
    const itemCount = items.length;
    const totalValue = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const avgPrice = itemCount > 0 ? totalValue / itemCount : 0;
    
    const uploadDate = new Date(user.createdAt || Date.now() - 365 * 24 * 60 * 60 * 1000);
    const monthsSinceUpload = Math.max(1, (Date.now() - uploadDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const uploadFrequency = itemCount / monthsSinceUpload;
    
    let color;
    if (uploadFrequency < 1) {
      color = 'rgba(59, 130, 246, 0.6)';
    } else if (uploadFrequency < 3) {
      color = 'rgba(34, 197, 94, 0.6)';
    } else if (uploadFrequency < 6) {
      color = 'rgba(251, 146, 60, 0.6)';
    } else {
      color = 'rgba(239, 68, 68, 0.6)';
    }
    
    return {
      x: itemCount,
      y: totalValue,
      r: Math.min(Math.max(avgPrice * 0.5, 8), 25),
      user: user,
      avgPrice: avgPrice,
      uploadFrequency: uploadFrequency
    };
  }).filter(user => user.x > 0 && user.y > 0);

  return {
    datasets: [
      {
        label: 'Wardrobe Analysis',
        data: bubbleData,
        backgroundColor: bubbleData.map(d => {
          if (d.uploadFrequency < 1) return 'rgba(59, 130, 246, 0.6)';
          if (d.uploadFrequency < 3) return 'rgba(34, 197, 94, 0.6)';
          if (d.uploadFrequency < 6) return 'rgba(251, 146, 60, 0.6)';
          return 'rgba(239, 68, 68, 0.6)';
        }),
        borderColor: bubbleData.map(d => {
          if (d.uploadFrequency < 1) return 'rgba(59, 130, 246, 1)';
          if (d.uploadFrequency < 3) return 'rgba(34, 197, 94, 1)';
          if (d.uploadFrequency < 6) return 'rgba(251, 146, 60, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 1,
      },
    ],
  };
};

export const getBubbleChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Wardrobe Value vs. Item Count Analysis',
      font: {
        size: 16,
        weight: 'bold',
      },
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        generateLabels: function() {
          return [
            {
              text: 'Blue: Low upload frequency (<1/mo)',
              fillStyle: 'rgba(59, 130, 246, 0.6)',
              strokeStyle: 'rgba(59, 130, 246, 1)',
              lineWidth: 1,
            },
            {
              text: 'Green: Medium frequency (1-3/mo)',
              fillStyle: 'rgba(34, 197, 94, 0.6)',
              strokeStyle: 'rgba(34, 197, 94, 1)',
              lineWidth: 1,
            },
            {
              text: 'Orange: High frequency (3-6/mo)',
              fillStyle: 'rgba(251, 146, 60, 0.6)',
              strokeStyle: 'rgba(251, 146, 60, 1)',
              lineWidth: 1,
            },
            {
              text: 'Red: Very high frequency (>6/mo)',
              fillStyle: 'rgba(239, 68, 68, 0.6)',
              strokeStyle: 'rgba(239, 68, 68, 1)',
              lineWidth: 1,
            },
            {
              text: 'Bubble size = Average item price',
              fillStyle: 'transparent',
              strokeStyle: '#666',
              lineWidth: 1,
            }
          ];
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const data = context.raw;
          return [
            `User: ${data.user.name}`,
            `Items: ${data.x}`,
            `Total Value: $${data.y.toFixed(2)}`,
            `Avg Price: $${data.avgPrice.toFixed(2)}`,
            `Upload Frequency: ${data.uploadFrequency.toFixed(1)}/month`
          ];
        }
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Number of Items',
      },
      beginAtZero: true,
    },
    y: {
      title: {
        display: true,
        text: 'Total Wardrobe Value ($)',
      },
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value;
        }
      }
    },
  },
});

export const formatExifData = (item) => {
  const exifFields = [];
  
  if (item.gps_lat && item.gps_lon) {
    exifFields.push({
      icon: "📍",
      label: "GPS",
      value: `${item.gps_lat.toFixed(6)}, ${item.gps_lon.toFixed(6)}`
    });
  }
  
  if (item.datetime_original) {
    exifFields.push({
      icon: "📅",
      label: "Date",
      value: new Date(item.datetime_original).toLocaleDateString()
    });
  }
  
  if (item.camera_make || item.camera_model) {
    exifFields.push({
      icon: "📷",
      label: "Camera",
      value: `${item.camera_make || ''} ${item.camera_model || ''}`.trim()
    });
  }
  
  if (item.software) {
    exifFields.push({
      icon: "📦",
      label: "Software",
      value: item.software
    });
  }
  
  return exifFields;
};