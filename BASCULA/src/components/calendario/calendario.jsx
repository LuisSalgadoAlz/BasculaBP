import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { getBoletasMes, getTimeLineDetails } from "../../hooks/formDataBoletas";
import { motion, AnimatePresence } from "framer-motion";
import { calendarVariants, expandedVariants } from "../../constants/boletas";
import Timeline from 'react-calendar-timeline';
import {BigSpinner, NoData, Spinner} from '../alerts'
import 'react-calendar-timeline/style.css';
import moment from 'moment';
import 'moment/locale/es'; // Asegúrate de importar el idioma

moment.locale('es'); // Establecer idioma a español


export const Calendario = () => {
  const [dateBolCalendar, setDateBolCalendar] = useState();
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [detailsDaySeletect, setDetailsSelect] = useState({groups:[], items:[]});
  const [isLoading, setIsloading]= useState(false)
  const [isLoadData, setIsLoadData] = useState(false)
  /**
   * Clicks en el dia
   * @param {} info 
   */
  const handleDayClick = async(info) => {
    const {date, view:{type}} = info
    if (type === 'dayGridMonth') {
      setExpandedDate(date);
      setCurrentView('timeGridDay');
      setDetailsSelect({groups:[], items:[]})
      await getTimeLineDetails(setDetailsSelect, date, setIsloading)
      console.log(detailsDaySeletect)

    }
  };

 /**
  * Clicks en el evento
  * @param {*} info 
  */
  const handleEventClick = async(info) => {
    const {event: {start}, view:{type}} = info
    if (type === 'dayGridMonth') {
      setExpandedDate(start);
      setCurrentView('timeGridDay');
      setDetailsSelect({groups:[], items:[]})
      await getTimeLineDetails(setDetailsSelect, start, setIsloading)
      console.log(detailsDaySeletect)
    }
  };

  const handleEventButtons = async(info) => {
    const { currentStart, currentEnd, type } = info.view;
    if (type === 'dayGridMonth') {
      getBoletasMes(setDateBolCalendar, new Date(currentStart).toISOString(), new Date(currentEnd).toISOString(), setIsLoadData);
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
      {isLoadData && !dateBolCalendar && <BigSpinner />}
      <AnimatePresence mode="wait">
        {currentView !== 'timeGridDay' ? (
          <motion.div
            key="month-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={calendarVariants}
            transition={{ duration: 0.3 }}
            className={`h-full ${isLoadData && !dateBolCalendar ? 'hidden' : ''}`}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              locale={esLocale}
              timeZone="local"
              headerToolbar={{
                left: 'dayGridMonth',
                center: 'title',
                right: 'today prev,next'
              }}
              events={dateBolCalendar}
              dateClick={handleDayClick}
              eventClick={handleEventClick}
              datesSet={handleEventButtons}
              viewDidMount={handleViewChange}
              height="550px"
              dayCellClassNames={() => ['custom-day-cell']}
              eventContent={(arg) => (
                <div style={{ textAlign: 'center',}}>
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
                {isLoading ? (
                  <BigSpinner />
                ) : !detailsDaySeletect || detailsDaySeletect.groups.length === 0 ? (
                  <div className="min-h-[80vh] flex items-center justify-center">
                    <NoData />
                  </div>
                ) : (
                  <TimelineComponent 
                    groups={detailsDaySeletect.groups} 
                    items={detailsDaySeletect.items} 
                    defaultTime={expandedDate}
                  />
                )}
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
  console.log(items)
  const reFactorItems = items.map((el) => ({
    ...el,  start_time:new Date(el.start_time), end_time: el.end_time ? new Date(el.end_time) : new Date(), isDefaultEndTime: !el.end_time
  })) 

  return (
    <div className="border-gray-300 p-4 rounded-2xl">
      <Timeline
        groups={groups}
        items={reFactorItems}
        sidebarContent={null}
        defaultTimeStart={new Date(defaultTime)}  // Comienza a las 00:00 horas
        defaultTimeEnd={new Date(end)}
        maxTime={new Date(end)} 
        minTime={new Date(defaultTime)}  // Termina a las 00:00 
        minZoom={60 * 60 * 1000}  // Mínimo zoom: 1 hora
        maxZoom={24 * 60 * 60 * 1000}  // Máximo zoom: 24 horas
        itemTouchSendsClick={false}
        itemHeightRatio={0.75}
        canMove={false}
        lineHeight={50} 
        itemRenderer={itemRenderer}
      />
    </div>
  );
};

 // Función para renderizar items personalizados
 const itemRenderer = ({ item, itemContext, getItemProps }) => { 

  const itemProps = getItemProps({
    className: item.isDefaultEndTime ? "item-red transition-transform duration-300 ease-in-out hover:scale-105" : "item-normal transition-transform duration-300 ease-in-out hover:scale-105", 
    style: {
      color: "white",
      borderRadius: "4px",
      boxShadow: "0 1px 5px rgba(0, 0, 0, 0.15)",
    }
  });
  
  // Formatear las fechas para mostrarlas en el tooltip
  const startTime = new Date(item.start_time);
  
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const tooltipText = `Placa ${item.title}, boleta ${item.id} - Inicio: ${formatTime(startTime)} - Estado:  NO FINALIZADA`;
  
  const {key, ...restPropsItems} = itemProps

  return (
    <div key={key} {...restPropsItems} onClick={()=>console.log('Testing')}>
      <div style={{ 
        padding: "4px 8px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative"
      }}>
        {/* Título principal del evento */}
        <div style={{ fontWeight: "bold" }}>
          {item.title}
        </div>
        
        {/* Tooltip SOLO para elementos sin fecha de fin */}
        {item.isDefaultEndTime && (
          <div className="timeline-tooltip" style={{ 
            position: "absolute",
            top: "0",
            left: "calc(100% + 1rem)", // 1rem de separación
            backgroundColor: "red",
            color: "white", 
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "11px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            pointerEvents: "none",
            height: "100%",
            display: "flex",
            alignItems: "center"
          }}>
            {tooltipText}
          </div>
        )}
      </div>
    </div>
  );
};