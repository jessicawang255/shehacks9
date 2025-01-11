import React, { useState } from 'react';
import './App.css';
import SyllabusUploader from './components/SyllabusUploader';

function App() {
  const [syllabusText, setSyllabusText] = useState('');
  const [weeklyOutline, setWeeklyOutline] = useState([]);
  const [toDoList, setToDoList] = useState([]);

  const handleFileParse = (text) => {
    setSyllabusText(text);
    const { weeklyOutline, toDoList } = parseSyllabusText(text);
    setWeeklyOutline(weeklyOutline);
    setToDoList(toDoList);
  };

  const parseSyllabusText = (text) => {
    const weekPattern = /Week\s+\d+:\s+.*?(?=\nWeek|\Z)/gs;
    const weeks = text.match(weekPattern) || [];

    const weeklyOutline = [];
    const toDoList = [];

    weeks.forEach((week) => {
      const weekInfo = {};
      const lines = week.split('\n').map((line) => line.trim()).filter(Boolean);

      if (lines.length > 0) {
        const [header, ...tasks] = lines;
        const weekHeaderMatch = header.match(/(Week\s+\d+):\s+(.*)/);
        if (weekHeaderMatch) {
          weekInfo.week = weekHeaderMatch[1];
          weekInfo.dateRange = weekHeaderMatch[2];
        }

        weekInfo.tasks = tasks;
        weeklyOutline.push(weekInfo);

        tasks.forEach((task) => {
          const taskInfo = { task };
          const dueDateMatch = task.match(/(\w+\s+\d{1,2})/); // Extract date if present
          if (dueDateMatch) {
            taskInfo.dueDate = dueDateMatch[1];
          }
          toDoList.push(taskInfo);
        });
      }
    });

    return { weeklyOutline, toDoList };
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Homework/Class Tracker</h1>
        <p>Start by uploading your syllabus.</p>
        <SyllabusUploader onFileParse={handleFileParse} />
        {weeklyOutline.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Weekly Outline:</h3>
            {weeklyOutline.map((week, index) => (
              <div key={index}>
                <h4>{week.week} ({week.dateRange})</h4>
                <ul>
                  {week.tasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {toDoList.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>To-Do List:</h3>
            <ul>
              {toDoList.map((item, index) => (
                <li key={index}>
                  {item.task} {item.dueDate ? `- Due: ${item.dueDate}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
