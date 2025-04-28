import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { getBoletasMes, getTimeLineDetails } from "../../hooks/formDataBoletas";
import { motion, AnimatePresence } from "framer-motion";
import { calendarVariants, expandedVariants } from "../../constants/boletas";
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/style.css';
import moment from 'moment';
import 'moment/locale/es'; // Asegúrate de importar el idioma

moment.locale('es'); // Establecer idioma a español


export const Calendario = () => {
  const [dateBolCalendar, setDateBolCalendar] = useState();
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [detailsDaySeletect, setDetailsSelect] = useState({groups:[], items:[]});

  const handleEventClick = async(info) => {
    if (info.view.type === 'dayGridMonth') {
      setExpandedDate(info.date);
      setCurrentView('timeGridDay');
      await getTimeLineDetails(setDetailsSelect, info.date)
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
              <TimelineComponent 
                groups={detailsDaySeletect ? detailsDaySeletect?.groups : []} 
                items={detailsDaySeletect ? detailsDaySeletect?.items : []} 
                defaultTime = {expandedDate}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TimelineComponent = ({groups, items, defaultTime}) => {

  const end = new Date(defaultTime); // Tu fecha local GMT-6
  // Sumamos 1 día
  end.setDate(end.getDate() + 1); 

  const reFactorItems = items.map((el) => ({
    ...el,  start_time:new Date(new Date(el.start_time)), end_time:new Date(new Date(el.end_time))
  }))

  return (
    <div>
      <Timeline
        groups={groups}
        items={reFactorItems}
        sidebarContent={null}
        defaultTimeStart={new Date(defaultTime)}  // Comienza a las 00:00 horas del 1 de abril
        defaultTimeEnd={new Date(end)}
        maxTime={new Date(end)} 
        minTime={new Date(defaultTime)}  // Termina a las 00:00 horas del 2 de abril
        minZoom={60 * 60 * 1000}  // Mínimo zoom: 1 hora
        maxZoom={24 * 60 * 60 * 1000}  // Máximo zoom: 24 horas
        itemTouchSendsClick={false}
        itemHeightRatio={0.75}
        canMove={false}
      />
    </div>
  );
};