import { Bar } from 'react-chartjs-2';

const PhotoHistogramChart = ({ histogramData, selectedUserId, usersWithItems }) => {
  const getFilteredHistogramData = () => {
    if (!selectedUserId) return histogramData;
    return histogramData.map(d => {
      const userSpecific = d.users?.find(u => u.userId === selectedUserId);
      return {
        label: d.label,
        count: userSpecific?.count || 0
      };
    });
  };

  const chartData = {
    labels: getFilteredHistogramData().map(d => d.label),
    datasets: [
      {
        label: selectedUserId ? `Photos Taken by ${usersWithItems.find(u => u.id === selectedUserId)?.name || 'User'}` : 'Photos Taken',
        data: getFilteredHistogramData().map(d => d.count),
        backgroundColor: selectedUserId ? 'rgba(139, 92, 246, 0.8)' : 'rgba(59, 130, 246, 0.8)',
        borderColor: selectedUserId ? 'rgba(139, 92, 246, 1)' : 'rgba(59, 130, 246, 1)',
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
        text: 'Photos Taken by Hour of Day',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hour of Day',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Photos',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
        📸 Photo Activity Timeline
      </h2>
      <div style={{ height: "400px", position: "relative" }}>
        {histogramData.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%",
            color: "#6b7280" 
          }}>
            No photo timestamp data available
          </div>
        )}
      </div>
      <div style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
        Showing when users take photos throughout the day (24-hour UTC format)
      </div>
    </div>
  );
};

export default PhotoHistogramChart;