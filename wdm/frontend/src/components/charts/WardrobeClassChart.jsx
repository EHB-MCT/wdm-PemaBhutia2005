import { Bar } from 'react-chartjs-2';

const WardrobeClassChart = ({ priceTierData, selectedUserId }) => {
  const getFilteredPriceTierData = () => {
    if (!selectedUserId) return priceTierData;
    return priceTierData.filter(user => user.userId === selectedUserId);
  };

  const chartData = {
    labels: getFilteredPriceTierData().map(user => user.userName),
    datasets: [
      {
        label: 'Budget (<$30)',
        data: getFilteredPriceTierData().map(user => user.percentages?.budget || 0),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Mid-range ($30-$100)',
        data: getFilteredPriceTierData().map(user => user.percentages?.midRange || 0),
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1,
      },
      {
        label: 'Premium (>$100)',
        data: getFilteredPriceTierData().map(user => user.percentages?.premium || 0),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'User Wardrobe Class Analysis',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value}%`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Users',
        },
        stacked: true,
      },
      y: {
        title: {
          display: true,
          text: 'Percentage of Wardrobe (%)',
        },
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
        💰 Wardrobe Class Distribution
      </h2>
      <div style={{ height: "450px", position: "relative" }}>
        {priceTierData.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%",
            color: "#6b7280" 
          }}>
            No price data available for class analysis
          </div>
        )}
      </div>
      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "14px", fontWeight: "600" }}>🟢 Budget (&lt;$30)</h4>
          <p style={{ margin: "0", color: "#15803d", fontSize: "12px" }}>Affordable items, budget-conscious shoppers</p>
        </div>
        <div style={{ padding: "1rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#1d4ed8", fontSize: "14px", fontWeight: "600" }}>🔵 Mid-range ($30-$100)</h4>
          <p style={{ margin: "0", color: "#1e40af", fontSize: "12px" }}>Standard retail price range</p>
        </div>
        <div style={{ padding: "1rem", backgroundColor: "#fef3c7", border: "1px solid #fed7aa", borderRadius: "0.5rem" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#d97706", fontSize: "14px", fontWeight: "600" }}>🟠 Premium (&gt;$100)</h4>
          <p style={{ margin: "0", color: "#b45309", fontSize: "12px" }}>High-end fashion, luxury brands</p>
        </div>
      </div>
    </div>
  );
};

export default WardrobeClassChart;