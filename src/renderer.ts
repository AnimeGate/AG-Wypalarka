import { installNetworkInterceptor } from "@/helpers/network-interceptor";

// Install network interceptor for debug console (before React renders)
installNetworkInterceptor();

import "@/App";
