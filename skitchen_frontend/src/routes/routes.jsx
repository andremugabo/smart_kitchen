import { createBrowserRouter } from "react-router-dom";
import * as Layouts from '../layouts';
import * as Pages from '../pages';



export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layouts.AuthLayouts/>,
        children: [
            {index:true, element:<Pages.LoginPage/>},
            {path:'*', element: <Pages.NotFoundPage/>}
        ]
    }
])