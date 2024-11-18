import React, { useEffect, useState } from "react";
import api from "../../api/api";
import Activity from "./Activity";
import Spinner from "../Spinner/Spinner.jsx";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

// Register required components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformanceData = async (selectedRepo) => {
    try {
      const response = await api.get(`/collaborator-performance/${selectedRepo}`);
      setPerformanceData(response.data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData(selectedRepo); // Fetch data when component mounts
  }, []);

  const handleFilter = async () => {
    console.log(selectedRepo);
    if (selectedRepo) {
      fetchPerformanceData(selectedRepo)
    }
  }
  // Prepare data for charts
  const usernames = performanceData.map(user => user.username);
  const prsCreated = performanceData.map(user => user.prsCreated);
  const prsMerged = performanceData.map(user => user.prsMerged);
  const prsReviewed = performanceData.map(user => user.prsReviewed);
  const commentsMade = performanceData.map(user => user.commentsMade);
  const [repositories, setRepositories] = useState([
    { name: 'nodes-project' },
    { name: 'python-php' }
  ]);
  const [selectedRepo, setSelectedRepo] = useState('nodes-project');

  // Chart data
  const barChartData = {
    labels: usernames,
    datasets: [
      {
        label: 'PRs Created',
        data: prsCreated,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'PRs Merged',
        data: prsMerged,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const lineChartData = {
    labels: usernames,
    datasets: [
      {
        label: 'PRs Reviewed',
        data: prsReviewed,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      },
    ],
  };

  const pieChartData = {
    labels: ['PRs Created', 'PRs Merged', 'PRs Reviewed', 'Comments Made'],
    datasets: [{
      data: [prsCreated.reduce((a, b) => a + b, 0), prsMerged.reduce((a, b) => a + b, 0), prsReviewed.reduce((a, b) => a + b, 0), commentsMade.reduce((a, b) => a + b, 0)],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 206, 86, 0.6)'],
    }],
  };

  return (
    <Activity>
      <div className="overflow-x-auto example mt-4">
        <div className="p-6 mt-4">
          <header>
            <div className="flex justify-between gap-5 lg:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="mb-1 text-2xl font-bold text-primary-500 dark:text-gray-300">
                    Dashboard
                  </div>
                </div>
              </div>
              <div>
              <form className="max-w-sm mx-auto flex flex-1 gap-4 pr-6">
        <select
          id="repositories"
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          {repositories.map((repo) => (
            <option key={repo.name} value={repo.name}>{repo.name}</option>
          ))}
        </select>
        <div>
          <button
            type="button"
            onClick={handleFilter}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Filter
          </button>
        </div>
      </form>
              </div>
            </div>
          </header>
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">{error}</p>
    
            </div>
          ) : performanceData.length !== 0 ? (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Bar Chart</h3>
                <Bar data={barChartData} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Line Chart</h3>
                <Line data={lineChartData} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Pie Chart</h3>
                <Pie data={pieChartData} />
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700">
              <p className="font-semibold">Nothing</p>
              <p className="mt-1">
                It seems there are currently no performance data available. You can create a new pull request to start contributing.
              </p>
            </div>
          )}

          {/* Table for overall performance data */}
          {performanceData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <h3 className="text-lg font-semibold">Overall Collaborator Performance</h3>
              <table className="min-w-full mt-2 bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Username</th>
                    <th className="px-4 py-2 border">PRs Created</th>
                    <th className="px-4 py-2 border">PRs Merged</th>
                    <th className="px-4 py-2 border">PRs Reviewed</th>
                    <th className="px-4 py-2 border">Comments Made</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map(user => (
                    <tr key={user.username}>
                      <td className="px-4 py-2 border">{user.username}</td>
                      <td className="px-4 py-2 border">{user.prsCreated}</td>
                      <td className="px-4 py-2 border">{user.prsMerged}</td>
                      <td className="px-4 py-2 border">{user.prsReviewed}</td>
                      <td className="px-4 py-2 border">{user.commentsMade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Activity>
  );
};

export default Dashboard;
