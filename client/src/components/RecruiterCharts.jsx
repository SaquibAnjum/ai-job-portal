import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ApplicationsPerDayChart = ({ data }) => {
  const chartData = {
    labels: data?.map((d) => d.day) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Applications Delivered',
        data: data?.map((d) => d.count) || [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#818cf8',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const HiringFunnelChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Submitted', 'Reviewed', 'Shortlisted', 'Interview', 'Tech Round', 'HR Round', 'Offer', 'Joined'],
    datasets: [
      {
        label: 'Candidates in Stage',
        data: data?.data || [45, 36, 22, 14, 8, 5, 3, 2],
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#a855f7',
          '#38bdf8',
          '#0ea5e9',
          '#14b8a6',
          '#10b981',
          '#22c55e',
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { grid: { display: false } },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const HiringTrendChart = ({ data }) => {
  const chartData = {
    labels: data?.map((d) => d.month) || ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Total Applications',
        data: data?.map((d) => d.applications) || [15, 28, 40, 52, 65, 80],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Hires Completed',
        data: data?.map((d) => d.hires) || [1, 2, 3, 4, 6, 8],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const SourceOfApplicantsChart = ({ data }) => {
  const chartData = {
    labels: data?.map((d) => d.source) || ['NexHire AI Portal', 'LinkedIn Direct', 'Employee Referral', 'Organic Search'],
    datasets: [
      {
        data: data?.map((d) => d.percentage) || [45, 30, 15, 10],
        backgroundColor: ['#6366f1', '#38bdf8', '#10b981', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10 } },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export const JobPerformanceChart = ({ data }) => {
  const chartData = {
    labels: data?.map((d) => d.title) || ['MERN Developer', 'AI Engineer', 'DevOps Lead'],
    datasets: [
      {
        label: 'Applicants Per Job',
        data: data?.map((d) => d.applicants) || [24, 18, 12],
        backgroundColor: '#818cf8',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={chartData} options={options} />;
};
