import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Slider,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SpeedIcon from '@mui/icons-material/Speed';

const AbhidhammaVisualizer = () => {
  const [data, setData] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [showVithi, setShowVithi] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const requestRef = useRef();
  const previousTimeRef = useRef();
  const pointsRef = useRef(0);
  const vithiPointsRef = useRef(0);

  const MAX_POINTS = 100;
  const VITHI_DURATION = 3;

  const generateVithiPoint = (step, intensity = 1) => {
    if (step >= VITHI_DURATION) {
      return 0;
    }
    const vithiPoint = Math.abs(Math.sin(step * (Math.PI / 1.5))) * intensity;
    return vithiPoint;
  };

  const animate = time => {
    if (previousTimeRef.current != undefined) {
      const rawDeltaTime = (time - previousTimeRef.current) * speed / 1000;
      const deltaTime = Math.min(rawDeltaTime, 5);
      setTimeElapsed(prevTime => prevTime + deltaTime);
      const pointsToAdd = speed > 1000 ? Math.ceil(Math.log10(speed)) : 1;
      if (timeElapsed > 0.05) {
        setTimeElapsed(0);
        for (let i = 0; i < pointsToAdd; i++) {
          let newValue = 0;
          if (showVithi && vithiPointsRef.current < VITHI_DURATION) {
            newValue = generateVithiPoint(vithiPointsRef.current);
            vithiPointsRef.current += 1;
          } else if (showVithi && vithiPointsRef.current >= VITHI_DURATION) {
            setShowVithi(false);
          }
          if (!showVithi) {
            newValue = Math.random() * 0.02;
          }
          const newPoint = {
            time: pointsRef.current,
            value: newValue,
            isVithi: (showVithi && vithiPointsRef.current < VITHI_DURATION + 1) || (vithiPointsRef.current >= VITHI_DURATION && newValue > 0.1)
          };
          setData(prevData => {
            const updatedData = [...prevData, newPoint];
            return updatedData.length > MAX_POINTS ? updatedData.slice(-MAX_POINTS) : updatedData;
          });
          pointsRef.current += 1;
        }
      }
    }
    previousTimeRef.current = time;
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, showVithi, speed, timeElapsed]);

  const triggerVithi = () => {
    setShowVithi(true);
    vithiPointsRef.current = 0;
  };

  const handleSpeedChange = (event, newValue) => {
    setSpeed(newValue);
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom align="center">
          Abhidhamma Consciousness Visualization
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -10 }} />
              <YAxis domain={[-2, 2]} label={{ value: 'Mental State', angle: -90, position: 'insideLeft' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#9e9e9e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 0 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey={point => point.isVithi ? point.value : null}
                stroke="#f44336"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>Bavanga Citta (Grey) - Continuous Life-Continuum Consciousness</Typography>
          <Typography gutterBottom>Citta Vithi (Red) - Cognitive Process of Consciousness</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={triggerVithi}
            disabled={showVithi}
            sx={{ flexGrow: 1 }}
          >
            Trigger Citta Vithi
          </Button>
          <IconButton onClick={toggleRunning} color="primary">
            {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Stack>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <SpeedIcon color="primary" />
            <Typography gutterBottom>Speed Control:</Typography>
            <Slider
              value={Math.log10(speed) + 1}
              onChange={(event, newValue) => {
                const logSpeed = Math.pow(10, newValue - 1);
                setSpeed(logSpeed);
              }}
              aria-labelledby="speed-slider"
              step={0.5}
              marks={[
                { value: 0, label: '0.1×' },
                { value: 1, label: '1×' },
                { value: 3, label: '100×' },
                { value: 5, label: '10K×' },
                { value: 7, label: '1M×' }
              ]}
              min={0}
              max={7}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => {
                const actualSpeed = Math.pow(10, value - 1);
                if (actualSpeed >= 1000000) return `${(actualSpeed / 1000000).toFixed(0)}M×`;
                if (actualSpeed >= 1000) return `${(actualSpeed / 1000).toFixed(0)}K×`;
                if (actualSpeed >= 10) return `${actualSpeed.toFixed(0)}×`;
                return `${actualSpeed.toFixed(1)}×`;
              }}
              sx={{ flexGrow: 1 }}
            />
          </Stack>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>About Citta in Abhidhamma</Typography>
          <Typography variant="body2" paragraph>
            In Abhidhamma philosophy, Bavanga Citta represents the passive stream of consciousness that flows when no active cognitive process is occurring. It's the default state of mind.
          </Typography>
          <Typography variant="body2" paragraph>
            When a stimulus is strong enough, it initiates a Citta Vithi (cognitive process), which consists of 17 thought moments that arise and pass away in rapid succession, processing the object of consciousness.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AbhidhammaVisualizer;