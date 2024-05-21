import React, { useEffect, useState } from 'react';
import { Container, Table } from '@mantine/core';
import '../tableComponent.css';

// Data fetching function
const fetchData = async () => {
  try {
    const response = await fetch('../data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return [];
  }
};

const processData = (data) => {
  // Handle missing values by replacing them with 0
  const cleanData = data.map(row => ({
    ...row,
    production: parseFloat(row['Crop Production (UOM:t(Tonnes))']) || 0,
    area: parseFloat(row['Area Under Cultivation (UOM:Ha(Hectares))']) || 0,
    cropYield: parseFloat(row['Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))']) || 0,
    year: row['Year'].match(/\d{4}/)[0],
    crop: row['Crop Name']
  }));

  // Aggregate data as required
  const yearAggregatedData = {};
  const cropAggregatedData = {};

  cleanData.forEach(row => {
    const { year, crop, production, area, cropYield } = row;

    // Yearly aggregation
    if (!yearAggregatedData[year]) {
      yearAggregatedData[year] = { max: row, min: row };
    } else {
      if (production > yearAggregatedData[year].max.production) {
        yearAggregatedData[year].max = row;
      }
      if (production < yearAggregatedData[year].min.production) {
        yearAggregatedData[year].min = row;
      }
    }

    // Crop aggregation
    if (!cropAggregatedData[crop]) {
      cropAggregatedData[crop] = { totalYield: 0, totalArea: 0, count: 0 };
    }
    cropAggregatedData[crop].totalYield += cropYield;
    cropAggregatedData[crop].totalArea += area;
    cropAggregatedData[crop].count += 1;
  });

  const yearTableData = Object.entries(yearAggregatedData).map(([year, { max, min }]) => ({
    year,
    maxCrop: max.crop,
    maxProduction: max.production,
    minCrop: min.crop,
    minProduction: min.production,
  }));

  const cropTableData = Object.entries(cropAggregatedData).map(([crop, { totalYield, totalArea, count }]) => ({
    crop,
    avgYield: (totalYield / count).toFixed(3),
    avgArea: (totalArea / count).toFixed(3),
  }));

  return { yearTableData, cropTableData };
};

const TableComponent = () => {
  const [yearTableData, setYearTableData] = useState([]);
  const [cropTableData, setCropTableData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData();
      if (data.length) {
        const { yearTableData, cropTableData } = processData(data);
        setYearTableData(yearTableData);
        setCropTableData(cropTableData);
      }
    };
    loadData();
  }, []);

  return (
    <Container>
      <h1>Indian Agriculture Analytics</h1>

      <h2>Yearly Crop Production</h2>
      <Table className="custom-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Crop with Maximum Production in that Year</th>
            <th>Crop with Minimum Production in that Year</th>
          </tr>
        </thead>
        <tbody>
          {yearTableData.map(({ year, maxCrop, maxProduction, minCrop, minProduction }) => (
            <tr key={year}>
              <td>{year}</td>
              <td>{maxCrop}</td>
              <td>{minCrop}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2>Crop Averages (1950-2020)</h2>
      <Table className="custom-table">
        <thead>
          <tr>
            <th>Crop</th>
            <th>Average Yield of the Crop between 1950-2020</th>
            <th>Average Cultivation Area of the Crop between 1950-2020</th>
          </tr>
        </thead>
        <tbody>
          {cropTableData.map(({ crop, avgYield, avgArea }) => (
            <tr key={crop}>
              <td>{crop}</td>
              <td>{avgYield}</td>
              <td>{avgArea}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default TableComponent;
