import axios from "axios";
import { BACKEND_URL } from "~/env";

export const Backend = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});
