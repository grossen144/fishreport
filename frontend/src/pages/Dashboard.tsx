import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { FishingReport } from "../types/fishing";

interface DashboardStats {
  totalReports: number;
  totalFish: number;
  averageFishPerTrip: number;
  mostCommonSpecies: string;
  bestLocation: string;
  recentReports: Array<{
    id: number;
    date: string;
    species: string;
    numberOfFish: number;
    location: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<DashboardStats>(
          "http://localhost:3003/api/reports/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setStats(response.data);
      } catch (error) {
        setError("Error fetching dashboard stats, " + error);
      }
    };

    fetchStats();
  }, []);

  const containerStyle = {
    maxWidth: "1200px",
    margin: "32px auto 32px",
    padding: "0 16px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  };

  const welcomeStyle = {
    margin: "0 0 24px",
    fontSize: "2rem",
    fontWeight: 500,
    color: "#333",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    height: "140px",
    display: "flex",
    flexDirection: "column" as const,
  };

  const cardTitleStyle = {
    margin: "0 0 16px",
    fontSize: "1.25rem",
    color: "#1976d2",
    fontWeight: 500,
  };

  const cardValueStyle = {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 500,
    color: "#333",
  };

  const sectionStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    marginTop: "24px",
  };

  const sectionTitleStyle = {
    margin: "0 0 16px",
    fontSize: "1.5rem",
    fontWeight: 500,
    color: "#333",
  };

  const recentReportsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  };

  const reportCardStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "16px",
  };

  const reportDateStyle = {
    margin: "0 0 8px",
    fontSize: "1.1rem",
    fontWeight: 500,
    color: "#333",
  };

  const reportDetailStyle = {
    margin: "4px 0",
    fontSize: "0.875rem",
    color: "#666",
  };

  const errorStyle = {
    color: "#d32f2f",
    fontSize: "1rem",
  };

  const loadingStyle = {
    fontSize: "1rem",
    color: "#666",
  };

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={errorStyle}>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={containerStyle}>
        <p style={loadingStyle}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={welcomeStyle}>Welcome back, {user?.name}!</h1>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Total Reports</h2>
          <p style={cardValueStyle}>{stats.totalReports}</p>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Total Fish Caught</h2>
          <p style={cardValueStyle}>{stats.totalFish}</p>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Average Fish per Trip</h2>
          <p style={cardValueStyle}>{stats.averageFishPerTrip.toFixed(1)}</p>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Most Common Species</h2>
          <p style={cardValueStyle}>{stats.mostCommonSpecies}</p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Best Location</h2>
        <p style={reportDetailStyle}>{stats.bestLocation}</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Recent Reports</h2>
        <div style={recentReportsGridStyle}>
          {stats.recentReports.map((report) => (
            <div key={report.id} style={reportCardStyle}>
              <p style={reportDateStyle}>
                {new Date(report.date).toLocaleDateString()}
              </p>
              <p style={reportDetailStyle}>Species: {report.species}</p>
              <p style={reportDetailStyle}>Fish: {report.numberOfFish}</p>
              <p style={reportDetailStyle}>Location: {report.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
