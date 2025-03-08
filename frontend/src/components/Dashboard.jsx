import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer as PieResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/data/dummyData.json') // Fetching the dummy data from the public folder
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error loading dummy data:', error));
  }, []);

  // Function to get overall status counts for the bar chart
  const getStatusCounts = () => {
    const statusCounts = {
      Pending: 0,
      Ongoing: 0,
      Completed: 0,
      Accepted: 0,
      Rejected: 0
    };

    data.forEach(user => {
      user.documents.forEach(document => {
        statusCounts[document.status]++;
      });
    });

    return [
      { name: 'Pending', count: statusCounts.Pending },
      { name: 'Ongoing', count: statusCounts.Ongoing },
      { name: 'Completed', count: statusCounts.Completed },
      { name: 'Accepted', count: statusCounts.Accepted },
      { name: 'Rejected', count: statusCounts.Rejected }
    ];
  };

  // Function to categorize users by status (Accepted, Rejected, Pending)
  const categorizeUsersByStatus = () => {
    const statusCounts = {
      Accepted: 0,
      Rejected: 0,
      Pending: 0
    };

    data.forEach(user => {
      let userStatus = 'Accepted'; // Assume user is Accepted unless proven otherwise

      user.documents.forEach(document => {
        if (document.status === 'Rejected') {
          userStatus = 'Rejected'; // If any document is Rejected, user is Rejected
        } else if (document.status === 'Pending' || document.status === 'Ongoing') {
          userStatus = 'Pending'; // If any document is Pending or Ongoing, user is Pending
        }
      });

      // Increment the appropriate status count for the user
      statusCounts[userStatus]++;
    });

    return [
      { name: 'Accepted', value: statusCounts.Accepted },
      { name: 'Rejected', value: statusCounts.Rejected },
      { name: 'Pending', value: statusCounts.Pending }
    ];
  };

  // Function to simulate time-based data for LineChart (e.g., requests over time)
  const getTimeBasedData = () => {
    // Example data: Date and count of requests
    return [
      { date: '2025-03-01', count: 50 },
      { date: '2025-03-02', count: 75 },
      { date: '2025-03-03', count: 100 },
      { date: '2025-03-04', count: 125 },
      { date: '2025-03-05', count: 150 }
    ];
  };

  return (
    <div className="p-6 flex flex-col space-y-6">
      <h2 className="text-2xl font-semibold">Verification Requests Dashboard</h2>

      {/* Create a flex row for the two charts to be side by side */}
      <div className="flex space-x-6">
        {/* BarChart displaying request status counts */}
        <div className="w-1/2 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getStatusCounts()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart displaying user status counts */}
        <div className="w-1/2 h-96">
          <PieResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorizeUsersByStatus()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                <Cell key="Accepted" fill="#4CAF50" />
                <Cell key="Rejected" fill="#F44336" />
                <Cell key="Pending" fill="#FF9800" />
              </Pie>
              <PieTooltip />
            </PieChart>
          </PieResponsiveContainer>
        </div>
      </div>

      {/* Create a flex row for the LineChart and Stacked BarChart to be side by side */}
      <div className="flex space-x-6">
        {/* LineChart showing trends over time (requests over time) */}
        <div className="w-1/2 h-96">
          <h3 className="text-xl font-medium">Requests Over Time</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getTimeBasedData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked BarChart showing distribution by user categories */}
        <div className="w-1/2 h-96">
          <h3 className="text-xl font-medium">Status Distribution by User</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getStatusCounts()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pending" stackId="a" fill="#FF9800" />
              <Bar dataKey="Accepted" stackId="a" fill="#4CAF50" />
              <Bar dataKey="Rejected" stackId="a" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
