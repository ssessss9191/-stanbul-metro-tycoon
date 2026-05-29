import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGame } from '../game/GameContext';
import { motion, AnimatePresence } from 'motion/react';
import { Train, Clock, MapPin, Gauge } from 'lucide-react';
import { Station, LineStats } from '../types';

const AnimatedTrain = ({
  lineId,
  stations,
  color,
  startIndex,
  onArrive,
  onLeave,
  trainIndex,
  reportStatus,
  timeHour,
  speedMode,
  reportTrainProgress,
}: {
  key?: string;
  lineId: string;
  stations: Station[];
  color: string;
  startIndex: number;
  onArrive: (id: string) => void;
  onLeave: (id: string) => void;
  trainIndex: number;
  reportStatus: (lineId: string, trainIndex: number, status: string) => void;
  timeHour: number;
  speedMode: 'slow' | 'normal' | 'fast';
  reportTrainProgress: (lineId: string, trainIndex: number, currentIndex: number, direction: number, status: string, startTime: number) => void;
}) => {
   const [currentIndex, setCurrentIndex] = useState(startIndex % stations.length);
   const [direction, setDirection] = useState(1);
   const [status, setStatus] = useState<'traveling' | 'waiting' | 'going_to_hangar' | 'in_hangar' | 'returning_from_hangar'>('waiting');
   const [statusStartTime, setStatusStartTime] = useState(Date.now());
   const tripsRef = useRef(0);
   
   const timeHourRef = useRef(timeHour);
   useEffect(() => {
       timeHourRef.current = timeHour;
   }, [timeHour]);
   
   const [targetPos, setTargetPos] = useState({ x: stations[startIndex % stations.length].x, y: stations[startIndex % stations.length].y });

   // Update start time on status or location update for accurate live ETAs
   useEffect(() => {
       setStatusStartTime(Date.now());
   }, [status, currentIndex]);

   // Determine connection and hangar positions using stretched values matching lines' coordinates
   const connectionIndex = useMemo(() => {
       return stations.findIndex(s => s.id === 'sanayi' || s.id === 'hasdal' || s.id === 'ayrilik_cesmesi');
   }, [stations]);

   const HANGAR_POS = useMemo(() => {
       return lineId === 'MARMARAY' 
            ? { x: 1027 + (startIndex * 2), y: 793 + (startIndex * 2) }
            : { x: 546 + (startIndex * 2), y: 253 + (startIndex * 2) };
   }, [lineId, startIndex]);

   // Fetch durations dynamically based on standard 10-second station travel and 3-second station pause
   const getDurations = () => {
       return { travel: 10000, pause: 3000, hangar: 12000 };
   };
   const { travel: travelDuration, pause: pauseDuration, hangar: hangarDuration } = getDurations();

   // Stabilize callbacks and arrays using refs to prevent movement timers from resetting on state updates
   const stationsRef = useRef(stations);
   const onArriveRef = useRef(onArrive);
   const onLeaveRef = useRef(onLeave);
   const reportStatusRef = useRef(reportStatus);
   const reportTrainProgressRef = useRef(reportTrainProgress);

   useEffect(() => {
       stationsRef.current = stations;
       onArriveRef.current = onArrive;
       onLeaveRef.current = onLeave;
       reportStatusRef.current = reportStatus;
       reportTrainProgressRef.current = reportTrainProgress;
   }, [stations, onArrive, onLeave, reportStatus, reportTrainProgress]);

   useEffect(() => {
       let active = true;

       if (status === 'waiting') {
           const stationId = stationsRef.current[currentIndex]?.id;
           if (stationId) {
               onArriveRef.current(stationId);
           }
           
           const timer = setTimeout(() => {
               if (!active) return;
               const currentHour = timeHourRef.current;
               const isNightShift = currentHour >= 0 && currentHour < 7;

               if (currentIndex === connectionIndex && (isNightShift || tripsRef.current >= 2)) {
                   setStatus('going_to_hangar');
                   setTargetPos(HANGAR_POS);
                   tripsRef.current = 0;
                   return;
               }

               let nextIndex = currentIndex + direction;
               let nextDirection = direction;
               
               const totalNumStations = stationsRef.current.length;
               if (nextIndex >= totalNumStations) {
                   nextIndex = totalNumStations - 2;
                   nextDirection = -1;
                   tripsRef.current += 1;
               } else if (nextIndex < 0) {
                   nextIndex = 1;
                   nextDirection = 1;
                   tripsRef.current += 1;
               }
               
               setCurrentIndex(nextIndex);
               setDirection(nextDirection);
               setStatus('traveling');
               setTargetPos({ x: stationsRef.current[nextIndex].x, y: stationsRef.current[nextIndex].y });
           }, pauseDuration);
           
           return () => {
               active = false;
               clearTimeout(timer);
               if (stationId) {
                   onLeaveRef.current(stationId);
               }
           };
       } else if (status === 'traveling') {
           const timer = setTimeout(() => {
               if (!active) return;
               setStatus('waiting');
           }, travelDuration);
           return () => {
               active = false;
               clearTimeout(timer);
           };
       } else if (status === 'going_to_hangar') {
           const timer = setTimeout(() => {
               if (!active) return;
               setStatus('in_hangar');
           }, travelDuration);
           return () => {
               active = false;
               clearTimeout(timer);
           };
       } else if (status === 'in_hangar') {
           let elapsed = 0;
           const checkInterval = setInterval(() => {
               if (!active) return;
               elapsed += 1000;
               const currentHour = timeHourRef.current;
               const isNightShift = currentHour >= 0 && currentHour < 7;
               
               if (!isNightShift && elapsed >= hangarDuration) {
                   setStatus('returning_from_hangar');
                   setTargetPos({ x: stationsRef.current[currentIndex].x, y: stationsRef.current[currentIndex].y });
                   clearInterval(checkInterval);
               }
           }, 1000);
           return () => {
               active = false;
               clearInterval(checkInterval);
           };
       } else if (status === 'returning_from_hangar') {
           const timer = setTimeout(() => {
               if (!active) return;
               setStatus('waiting');
           }, travelDuration);
           return () => {
               active = false;
               clearTimeout(timer);
           };
       }
   }, [status, currentIndex, direction, connectionIndex, travelDuration, pauseDuration, hangarDuration, HANGAR_POS.x, HANGAR_POS.y]);

   useEffect(() => {
       reportStatusRef.current(lineId, trainIndex, status);
       reportTrainProgressRef.current(lineId, trainIndex, currentIndex, direction, status, statusStartTime);
   }, [status, currentIndex, direction, lineId, trainIndex, statusStartTime]);

   return (
       <motion.div
           initial={false}
           animate={{ 
              left: targetPos.x - 16, 
              top: targetPos.y - 12, 
              opacity: status === 'in_hangar' ? 0.3 : 1,
              scale: status === 'in_hangar' ? 0.8 : 1
           }}
           transition={{ duration: (status === 'traveling' || status === 'going_to_hangar' || status === 'returning_from_hangar') ? (travelDuration / 1000) : 0.5, ease: "easeInOut" }}
           className="absolute w-12 h-6 flex items-center justify-center rounded-md border-2 border-white shadow-xl text-[10px] font-black text-white z-10"
           style={{ backgroundColor: color }}
       >
          {status === 'in_hangar' ? 'PASİF' : lineId}
       </motion.div>
   )
}

export default function MapScreen() {
  const { state, buyTrain, addAlert, reportTrainStatus } = useGame();
  const [zoom, setZoom] = useState(1);
  const [draggingLine, setDraggingLine] = useState<string | null>(null);
  const [activeStations, setActiveStations] = useState<Record<string, number>>({});
  
  // Custom states to handle train transit schedules dynamically with live counts
  const [speedMode, setSpeedMode] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [trainProgress, setTrainProgress] = useState<Record<string, { currentIndex: number, direction: number, status: string, startTime: number }>>({});

  // Dynamic seconds ticker state to update the precise arrival countdown displays in real time
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => {
          setNow(Date.now());
      }, 250); // High-fidelity redraw frequency
      return () => clearInterval(interval);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleArrive = useCallback((stationId: string) => {
      setActiveStations(prev => ({
          ...prev,
          [stationId]: (prev[stationId] || 0) + 1
      }));
  }, []);

  const handleLeave = useCallback((stationId: string) => {
      setActiveStations(prev => ({
          ...prev,
          [stationId]: Math.max(0, (prev[stationId] || 1) - 1)
      }));
  }, []);

  const reportTrainProgress = useCallback((lineId: string, trainIndex: number, currentIndex: number, direction: number, status: string, startTime: number) => {
      setTrainProgress(prev => ({
          ...prev,
          [`${lineId}_${trainIndex}`]: { currentIndex, direction, status, startTime }
      }));
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.4));

  const handleDragEnd = (event: any, info: any, originLineId: string) => {
      setDraggingLine(null);
      if (info.offset.y < -50) {
          const success = buyTrain(originLineId);
          if (!success) {
             addAlert('Yeni tren için yetersiz bütçe!', 'warning');
          } else {
             addAlert(`${originLineId} hattına yeni tren sefere başladı!`, 'success');
          }
      }
  };

  // Mathematically stretch the coordinates of the stations to make intervals/distances between stations wider
  const lines = useMemo(() => {
     return (Object.values(state.lines) as LineStats[]).map((line: LineStats) => ({
        ...line,
        stations: line.stations.map(st => ({
           ...st,
           x: Math.round(50 + (st.x - 20) * 1.55),
           y: Math.round(50 + (st.y - 50) * 1.35)
        }))
     }));
  }, [state.lines]);

  // Compute real-time physical arrival ETA of the next train for any station on any line using ticks
  const getStationETA = useCallback((lineId: string, stationIdx: number, numStations: number) => {
      const trainsOnLine = Object.keys(trainProgress)
          .filter(key => key.startsWith(`${lineId}_`))
          .map(key => trainProgress[key]);

      if (trainsOnLine.length === 0) return null;

      const travelDur = 10000; // 10 seconds
      const pauseDur = 3000;   // 3 seconds

      const currentTime = now; // dynamic ticking timestamp

      const etas = trainsOnLine.map(t => {
          if (t.status === 'in_hangar' || t.status === 'going_to_hangar' || t.status === 'returning_from_hangar') {
              return 999999;
          }

          const elapsed = Math.max(0, currentTime - (t.startTime || currentTime));
          let currentPos = t.currentIndex;
          let currentDir = t.direction;
          let currentStatus = t.status;
          
          let totalMs = 0;
          
          if (currentStatus === 'waiting') {
              if (currentPos === stationIdx) {
                  return 0; // Already here
              }
              const remainingPause = Math.max(0, pauseDur - elapsed);
              totalMs += remainingPause;
              
              for (let i = 0; i < 40; i++) {
                  let nextPos = currentPos + currentDir;
                  if (nextPos >= numStations) {
                      currentDir = -1;
                      nextPos = numStations - 2;
                  } else if (nextPos < 0) {
                      currentDir = 1;
                      nextPos = 1;
                  }
                  totalMs += travelDur;
                  if (nextPos === stationIdx) {
                      return totalMs / 1000;
                  }
                  totalMs += pauseDur;
                  currentPos = nextPos;
              }
          } else if (currentStatus === 'traveling') {
              const remainingTravel = Math.max(0, travelDur - elapsed);
              totalMs += remainingTravel;
              
              if (currentPos === stationIdx) {
                  return totalMs / 1000;
              }
              
              for (let i = 0; i < 40; i++) {
                  totalMs += pauseDur;
                  let nextPos = currentPos + currentDir;
                  if (nextPos >= numStations) {
                      currentDir = -1;
                      nextPos = numStations - 2;
                  } else if (nextPos < 0) {
                      currentDir = 1;
                      nextPos = 1;
                  }
                  totalMs += travelDur;
                  if (nextPos === stationIdx) {
                      return totalMs / 1000;
                  }
                  currentPos = nextPos;
              }
          }
          
          return 999999;
      });

      const minETA = Math.min(...etas);
      return minETA > 5000 ? null : minETA;
  }, [trainProgress, now]);

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col" ref={containerRef} id="map_screen_main_container">
      
      {/* Zoom and Speed Panel Overlay (Styled with white theme) */}
      <div className="absolute right-4 top-24 z-40 flex flex-col space-y-3 pointer-events-auto">
         <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 border border-slate-200 shadow-xl flex flex-col space-y-2">
            <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center text-lg font-black text-slate-800 bg-slate-100 hover:bg-slate-200 active:translate-y-1 transition-all rounded-xl shadow-sm border border-slate-200">+</button>
            <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center text-lg font-black text-slate-800 bg-slate-100 hover:bg-slate-200 active:translate-y-1 transition-all rounded-xl shadow-sm border border-slate-200 pb-1">-</button>
         </div>
      </div>

      {/* Pannable/Zoomable Map Area */}
      <div className="flex-1 overflow-auto touch-pan-x touch-pan-y pt-20 pb-40">
        <div 
          className="relative origin-top-left transition-transform duration-300 ease-out"
          style={{ width: 1200, height: 1100, transform: `scale(${zoom})` }}
        >
          {/* Stylized water / decor - Elegant Light blue water style */}
          <div className="absolute top-[450px] left-[400px] w-[600px] h-[550px] bg-sky-100/60 rotate-[25deg] rounded-[120px] opacity-60 blur-3xl"></div>
          
          <svg className="absolute inset-0 w-full h-full" overflow="visible">
            {/* Draw Paths */}
            {lines.map((line) => {
               const points = line.stations.map(s => `${s.x},${s.y}`).join(' ');
               return (
                 <g key={line.id + '_path'}>
                    {/* Shadow/Glow */}
                    <polyline points={points} fill="none" stroke={line.color} strokeWidth="16" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Base Outer Line */}
                    <polyline points={points} fill="none" stroke={line.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Inner Hollow Line for Double Track Effect */}
                    <polyline points={points} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 </g>
               )
            })}

            {/* Hangar Paths (with recalculated coordinates aligning perfectly with stretched stations) */}
            <g>
              <polyline points="701,307 546,253" fill="none" stroke="#10b981" strokeWidth="6" strokeOpacity="0.3" strokeDasharray="5,5" strokeLinecap="round" />
              <polyline points="391,334 546,253" fill="none" stroke="#8A2BE2" strokeWidth="6" strokeOpacity="0.3" strokeDasharray="5,5" strokeLinecap="round" />
              <circle cx="546" cy="253" r="16" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
              <text x="572" y="258" fill="#1e293b" fontSize="11" fontWeight="950" className="font-sans tracking-wide">ORTAK HANGAR</text>
              
              <polyline points="872,928 1027,793" fill="none" stroke="#005b9f" strokeWidth="6" strokeOpacity="0.3" strokeDasharray="5,5" strokeLinecap="round" />
              <circle cx="1027" cy="793" r="16" fill="#ffffff" stroke="#38bdf8" strokeWidth="3" />
              <text x="1053" y="798" fill="#1e293b" fontSize="11" fontWeight="950" className="font-sans tracking-wide">ANADOLU HANGAR</text>
            </g>
            
            {/* Draw Stations and custom LED Arrival Indicator Screens */}
            {lines.map((line) => 
               line.stations.map((st, i) => {
                 const isActive = activeStations[st.id] > 0;
                 return (
                 <g key={line.id + st.id}>
                    <AnimatePresence>
                       {isActive && (
                          <motion.circle
                             initial={{ r: 8, opacity: 0.8 }}
                             animate={{ r: 24, opacity: 0 }}
                             exit={{ opacity: 0 }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                             cx={st.x}
                             cy={st.y}
                             fill="none"
                             stroke={line.color}
                             strokeWidth="4"
                          />
                       )}
                    </AnimatePresence>
                    <motion.circle 
                       cx={st.x} 
                       cy={st.y} 
                       r="8" 
                       fill="#ffffff" 
                       stroke={line.color} 
                       strokeWidth="4" 
                       animate={isActive ? { scale: 1.4, fill: '#0f172a' } : { scale: 1 }}
                       transition={{ type: 'spring', bounce: 0.5 }}
                       style={{ transformOrigin: `${st.x}px ${st.y}px` }}
                       className="cursor-pointer"
                    />
                    
                    {/* Station Name text wrapper with rich dark text and clean contrast */}
                    <text x={st.x + 18} y={st.y - 2} fill="#1e293b" fontSize="11" fontWeight="800" className="font-sans select-none drop-shadow">
                      {st.name}
                    </text>

                    {/* Glowing LED ETA Information Sub-Panel Screen */}
                    {(() => {
                       const eta = getStationETA(line.id, i, line.stations.length);
                       const isWaitingHere = activeStations[st.id] > 0;
                       
                       let displayText = "SEFER YOK";
                       let bgFill = "#f1f5f9";
                       let borderCol = "#cbd5e1";
                       let textFill = "#64748b"; // muted slate
                       
                       if (isWaitingHere) {
                           displayText = "🟢 GELDİ";
                           bgFill = "#d1fae5";
                           borderCol = "#10b981";
                           textFill = "#065f46"; // beautiful forest green
                       } else if (eta !== null) {
                           const etaSecs = Math.max(0, eta);
                           // Format cleanly, e.g. "⏱️ 8 sn"
                           const etaSeconds = Math.round(etaSecs);
                           displayText = `⏱️ ${etaSeconds} sn`;
                           bgFill = "#fffbeb"; // warm amber box
                           borderCol = "#f59e0b";
                           textFill = "#b45309"; // rich amber text
                       }
                       
                       return (
                          <g transform={`translate(${st.x + 18}, ${st.y + 5})`} className="select-none">
                             {/* Mini Screen frame */}
                             <rect width="60" height="15" rx="4" fill={bgFill} stroke={borderCol} strokeWidth="1" className="shadow-md" />
                             {/* LCD character representation */}
                             <text x="30" y="11" textAnchor="middle" fill={textFill} fontSize="8" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">
                                {displayText}
                             </text>
                          </g>
                       );
                    })()}
                 </g>
                 );
               })
            )}
          </svg>

          {/* Animated Trains along the tracks */}
          {lines.map((line) => {
             return Array.from({ length: line.trains }).map((_, i) => (
                <AnimatedTrain 
                   key={`${line.id}-train-${i}`} 
                   lineId={line.id}
                   stations={line.stations} 
                   color={line.color} 
                   startIndex={i * Math.floor(line.stations.length / Math.max(1, line.trains))}
                   onArrive={handleArrive}
                   onLeave={handleLeave}
                   trainIndex={i}
                   reportStatus={reportTrainStatus}
                   timeHour={state.timeHour}
                   speedMode={speedMode}
                   reportTrainProgress={reportTrainProgress}
                />
             ));
          })}
        </div>
      </div>

      {/* Dragging Overlay */}
      <AnimatePresence>
        {draggingLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-40 pointer-events-none flex items-center justify-center backdrop-blur-sm bg-slate-900/40`}
          >
            <motion.div 
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className={`p-10 rounded-full border-8 border-dashed shadow-2xl ${draggingLine === 'M2' ? 'border-emerald-500 bg-white/95 text-emerald-600' : 'border-purple-500 bg-white/95 text-purple-600'} text-center`}
            >
               <Train className="w-20 h-20 mx-auto mb-4" />
               <h2 className="text-2xl font-black uppercase tracking-widest drop-shadow-sm">TRENİ BURAYA BIRAK</h2>
               <p className="font-bold text-sm mt-2">{draggingLine} Hattına Sefer Eklenecek</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Train Depot Drawer at bottom (above bottom navigation bar - elegant white layout) */}
      <div className="absolute bottom-24 left-4 right-4 z-30 bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-slate-200 shadow-xl pointer-events-auto" id="control_and_depot_panel">
         {/* Upper Section: Train Depot S&B controls */}
         <div className="flex items-center space-x-2 text-slate-800 pb-3 mb-3 border-b border-slate-100">
            <Train className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">TREN SEVKİYAT ALANI (Sürükle & Bırak)</h3>
         </div>

         {/* Lower Section: Active train drag entities */}
         <div className="flex justify-around items-center space-x-4">
            
            <div className="flex flex-col items-center">
              <motion.div 
                 drag
                 dragSnapToOrigin={true}
                 onDragStart={() => setDraggingLine('M2')}
                 onDragEnd={(e, i) => handleDragEnd(e, i, 'M2')}
                 whileDrag={{ scale: 1.25, zIndex: 100 }}
                 className="w-14 h-14 bg-slate-50 hover:bg-slate-100 border-4 border-emerald-500 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:border-emerald-400 touch-none shadow-md transition-colors"
              >
                  <Train className="text-emerald-500 w-6 h-6" />
              </motion.div>
              <span className="text-[10px] text-slate-600 font-bold mt-2 uppercase tracking-wider">M2 HATTI</span>
            </div>

            <div className="flex flex-col items-center">
              <motion.div 
                 drag
                 dragSnapToOrigin={true}
                 onDragStart={() => setDraggingLine('M11')}
                 onDragEnd={(e, i) => handleDragEnd(e, i, 'M11')}
                 whileDrag={{ scale: 1.25, zIndex: 100 }}
                 className="w-14 h-14 bg-slate-50 hover:bg-slate-100 border-4 border-purple-500 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:border-purple-400 touch-none shadow-md transition-colors"
              >
                  <Train className="text-purple-500 w-6 h-6" />
              </motion.div>
              <span className="text-[10px] text-slate-600 font-bold mt-2 uppercase tracking-wider">M11 HATTI</span>
            </div>

         </div>
      </div>
    </div>
  );
}
