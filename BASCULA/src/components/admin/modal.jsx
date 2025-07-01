import { IoCloseSharp } from "react-icons/io5";
import { propsMotionHijo, propsMotionPadre } from "../../constants/global";
import { motion } from "framer-motion";
import { InputsFormBoletas } from "../boletas/inputs";
import { buttonCancel, buttonSave, claseFormInputs, classFormSelct } from "../../constants/boletas";
import SelectFormBoletas from "../boletas/select";

const classPadre =
  "fixed inset-0 flex items-center justify-center bg-opacity-50 z-40 min-h-screen overflow-auto bg-opa-50";
const classHijo =
  "bg-white min-h-[20vh] max-w-[90vw] md:max-w-[30vw] max-h-[95vh] rounded-2xl max-sm:overflow-auto max-sm:min-h-[0px] shadow-lg overflow-y-auto boletas border-8 border-white px-10 py-5 max-sm:p-10";

const opt = [
    {id:1, nombre:'BASCULA'},
    {id:2, nombre:'CONTABILIDAD'}, 
    {id:3, nombre:'TOLVA'}, 
    {id:4, nombre:'ADMINISTRADOR'},
    {id:5, nombre:'GUARDIA'},  
]

const optState = [
    {id:1, nombre:'ACTIVO'},
    {id:2, nombre:'INACTIVO'},  
]

export const ModalAgregarUsuarios = (props) => {
  const { hdlClose, handleChange, formUsers, hdlCancel, hdlSaveUser } = props;

  return (
    <motion.div {...propsMotionPadre} className={classPadre}>
      <motion.div {...propsMotionHijo} className={classHijo}>
        <div className="mb-1 flex justify-between gap-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Agregar Nuevo Usuario
            </h2>
          </div>
          <div className="items-start h-full">
            <button onClick={hdlClose} className="text-4xl">
              <IoCloseSharp className="hover:scale-105" />
            </button>
          </div>
        </div>
        <div className="mt-2 mb-4">
          <p className="text-sm text-gray-500">
            <strong>Advertencia</strong>: Estás a punto de agregar un nuevo
            usuario que tendra acceso a las diferentes sistemas de Baprosa.{" "}
          </p>
          <hr className="text-gray-300 my-2" />
        </div>
        <div className="mb-1 flex justify-between gap-7">
          <div className="grid grid-cols-1 items-center w-full space-y-2">
            <InputsFormBoletas data={claseFormInputs} name={"Nombre"} fun={handleChange} val={formUsers?.Nombre} />
            <InputsFormBoletas data={claseFormInputs} name={"Usuario"} fun={handleChange} val={formUsers?.Usuario} />
            <SelectFormBoletas classCss={classFormSelct} name="Tipo" data={opt} fun={handleChange} val={formUsers?.Tipo}/>
            <InputsFormBoletas data={claseFormInputs} name={"Gmail"} fun={handleChange} val={formUsers?.Gmail} />
            <label className="block mb-2 text-sm font-medium text-gray-900 ">Contraseña</label>
            <input
              type="password"
              id={'Contraseña'}
              name={'Contraseña'}
              className={claseFormInputs}
              placeholder={`Ingrese contraseña`}
              required
              onChange={handleChange}
            />
          </div>
        </div>
        <hr className="text-gray-300 my-2 " />
        <div className="grid grid-cols-2 mt-4 gap-2">
            <button className={buttonCancel} onClick={hdlCancel}>Cancelar</button>
            <button className={buttonSave} onClick={hdlSaveUser}>Agregar</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ModalEditUsuarios = (props) => {
  const { hdlClose, handleChange, formUsers, hdlCancel, handleUpdateUser } = props;

  return (
    <motion.div {...propsMotionPadre} className={classPadre}>
      <motion.div {...propsMotionHijo} className={classHijo}>
        <div className="flex justify-between gap-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Editar Usuario
            </h2>
          </div>
          <div className="items-start h-full">
            <button onClick={hdlClose} className="text-4xl">
              <IoCloseSharp className="hover:scale-105" />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 flex flex-col">
            <span><strong>Nota:</strong> No puede ver la contraseña del usuario pero puede cambiarla.</span>
          </p>
          <hr className="text-gray-300 my-2" />
        </div>
        <div className="mb-1 flex justify-between gap-7">
          <div className="grid grid-cols-1 items-center w-full space-y-2">
            <InputsFormBoletas data={claseFormInputs} name={"Nombre"} fun={handleChange} val={formUsers?.Nombre} />
            <InputsFormBoletas data={claseFormInputs} name={"Usuario"} fun={handleChange} val={formUsers?.Usuario} />
            <SelectFormBoletas classCss={classFormSelct} name="Tipo" data={opt} fun={handleChange} val={formUsers?.Tipo}/>
            <InputsFormBoletas data={claseFormInputs} name={"Gmail"} fun={handleChange} val={formUsers?.Gmail} />
            <label className="block mb-2 text-sm font-medium text-gray-900 ">Ingrese una nueva contraseña</label>
            <input
              type="password"
              id={'Contraseña'}
              name={'nuevaContraseña'}
              className={claseFormInputs}
              placeholder={`Ingrese la nueva contraseña`}
              required
              onChange={handleChange}
            />
            <SelectFormBoletas classCss={classFormSelct} name="Estado" data={optState} fun={handleChange} val={formUsers?.Estado}/>
          </div>
        </div>
        <hr className="text-gray-300 my-2 " />
        <div className="grid grid-cols-2 mt-4 gap-2">
            <button className={buttonCancel} onClick={hdlCancel}>Cancelar</button>
            <button className={buttonSave} onClick={handleUpdateUser}>Modificar</button>
        </div>
      </motion.div>
    </motion.div>
  );
};