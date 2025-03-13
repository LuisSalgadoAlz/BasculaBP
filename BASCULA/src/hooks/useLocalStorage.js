import { useEffect, useState } from "react"

const useLocalStorage = (localStorageValue, defaultValue) => {
    const valorInicial = window.localStorage.getItem('token') || defaultValue
    const [value, setValue] = useState(valorInicial)

    useEffect(() => {
        window.localStorage.setItem(localStorageValue, value)
    }, [value]);

    return [value, setValue]
}

export default useLocalStorage;