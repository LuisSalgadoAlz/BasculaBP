import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { getBoletasMes, getDataBoletasPorID, getTimeLineDetails } from "../../hooks/formDataBoletas";
import { motion, AnimatePresence } from "framer-motion";
import { calendarVariants, expandedVariants } from "../../constants/boletas";
import Timeline from 'react-calendar-timeline';
import {BigSpinner, NoData, Spinner} from '../alerts'
import 'react-calendar-timeline/style.css';
import moment from 'moment';
import 'moment/locale/es';
import { VisualizarBoletas } from "../boletas/formBoletas";
import { getPorcentajeMes, getPorcentajeMesPorDia } from "../../hooks/informes/guardia";
import TableSheet from "../informes/tables";

moment.locale('es'); // Establecer idioma a español

const CONFIG_COLORS = {
  'Completado': 'item-completado', // Verde oscuro elegante
  'Completo(Fuera de tolerancia)': 'item-completado', // Amarillo suave
  'Cancelada': 'item-cancelada' // Gris neutro
}

const CONFIG_COLORS_LABELS = {
  'Completado': '#4b2e1c', // Verde oscuro elegante
  'Completo(Fuera de tolerancia)': '#4b2e1c', // Amarillo suave
  'Cancelada': '#9e9e9e' // Gris neutro
}

export const CalendarioPases = () => {
  const [dateBolCalendar, setDateBolCalendar] = useState();
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [detailsDaySeletect, setDetailsSelect] = useState({groups:[], items:[]});
  const [isLoading, setIsloading]= useState(false)
  const [isLoadData, setIsLoadData] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [openSheet, setOpenSheet] = useState(false)

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
      await getPorcentajeMesPorDia(setDetailsSelect, date, setIsloading)

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
      await getPorcentajeMesPorDia(setDetailsSelect, start, setIsloading)
    }
  };

  const handleEventButtons = async(info) => {
    const { currentStart, currentEnd, type } = info.view;
    if (type === 'dayGridMonth') {
      getPorcentajeMes(setDateBolCalendar, new Date(currentStart).toISOString(), new Date(currentEnd).toISOString(), setIsLoadData);
      setSelectedDate(currentStart)
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

  const sheetProps = {
        openSheet, 
        setOpenSheet, 
        tableData: detailsDaySeletect?.boletas || [{}], 
        title: 'Detalles Pases De Salida', 
        subtitle: `Visualización de pases de salida del día: ${selectedDate}`, 
        type: true,
        fixedColumns: ['Boleta', 'Pase de Salida', 'Placa', 'Transporte'] 
    }

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
              initialDate={selectedDate}
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
              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                  <div className="max-h-[89vh] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100  [&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <TableSheet {...sheetProps} />
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};