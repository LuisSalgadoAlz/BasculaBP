import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { getBoletasMes } from "../../hooks/formDataBoletas";
import { motion, AnimatePresence } from "framer-motion";
import { calendarVariants, expandedVariants } from "../../constants/boletas";

export const Calendario = () => {
  const [dateBolCalendar, setDateBolCalendar] = useState();
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');

  const handleEventClick = (info) => {
    if (info.view.type === 'dayGridMonth') {
      setExpandedDate(info.dateStr);
      setCurrentView('timeGridDay');
      console.log(info)
    }
  };

  const handleEventButtons = async(info) => {
    const { currentStart, currentEnd, type } = info.view;
    if (type === 'dayGridMonth') {
      getBoletasMes(setDateBolCalendar, new Date(currentStart).toISOString(), new Date(currentEnd).toISOString());
    }
  };

  const handleViewChange = (info) => {
    setCurrentView(info.view.type);
    if (info.view.type !== 'timeGridDay') {
      setExpandedDate(null);
    }
  };

  const handleCloseExpanded = () => {
    setCurrentView('dayGridMonth');
    setExpandedDate(null);
  };


  return (
    <div className="p-6 relative min-h-[600px]">
      <AnimatePresence mode="wait">
        {currentView !== 'timeGridDay' ? (
          <motion.div
            key="month-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={calendarVariants}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              locale={esLocale}
              timeZone="local"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={dateBolCalendar}
              dateClick={handleEventClick}
              eventClick={handleEventClick}
              datesSet={handleEventButtons}
              viewDidMount={handleViewChange}
              height="550px"
              dayCellClassNames={() => ['custom-day-cell']}
              eventContent={(arg) => (
                <div style={{ textAlign: 'center' }}>
                  {arg.event.title}
                </div>
              )}
            />
          </motion.div>
        ) : (
          <motion.div
            key="day-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={expandedVariants}
            className="fixed inset-0 z-50 bg-white p-6 overflow-auto"
          >
            <motion.button 
              onClick={handleCloseExpanded}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Volver al calendario
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FullCalendar
                plugins={[timeGridPlugin]}
                initialView="timeGridDay"
                initialDate={expandedDate}
                locale={esLocale}
                timeZone="local"
                headerToolbar={false}
                height="auto"
                contentHeight="auto"
                events={dateBolCalendar?.filter(event => 
                  event.start?.startsWith(expandedDate) || 
                  event.start?.includes(expandedDate)
                )}
                eventContent={(arg) => (
                  <div style={{ textAlign: 'center' }}>
                    {arg.event.title}
                  </div>
                )}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};