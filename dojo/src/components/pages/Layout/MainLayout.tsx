// import { Outlet, useNavigate } from "react-router-dom";
// import { Navbar } from '../../organisms/Navbar/Navbar';
// import { useEffect, useState } from "react";
// import { Footer } from '../../organisms/Footer/Footer';
// // 1. Import your API endpoints configuration
// import { API_ENDPOINTS } from "../../constants/api";

// // 🔹 Import Redux
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState, AppDispatch } from "../../../store/store";
// import { logout, clearAuth } from "../../hooks/useAuth";
// import { NAVIGATION_ROUTES } from "../../constants/navigation";

// // Mock user data
// const mockUser = {
// 	first_name: 'John',
// 	last_name: 'Doe',
// 	email: 'john.doe@example.com'
// };

// interface CompanyLogo {
// 	id: number;
// 	name: string;
// 	logo: string;
// 	uploaded_at: string;
// }

// type SizeOption = "small" | "medium" | "large";

// interface MainLayoutProps {
// 	size?: SizeOption;
// }

// const MainLayout = ({ size = "medium" }: MainLayoutProps) => {
// 	const [companyLogo, setCompanyLogo] = useState<CompanyLogo | null>(null);
// 	const [logoLoading, setLogoLoading] = useState(true);


// 	//Get logged-in user from Redux
// 	const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
// 	const dispatch = useDispatch<AppDispatch>();
// 	const navigate = useNavigate();




// 	const footerData = {
// 		companyName: "NL Technologies Pvt.Ltd",
// 		companyUrl: "http://www.NL Technologies Pvt.Ltdecsolutions.com/",
// 		tagline: "Empowering Industrial Excellence Through Digital Transformation",
// 	};

// 	useEffect(() => {
// 		const fetchCompanyLogo = async () => {
// 			// 2. Construct the full URL using the imported constants
// 			const logoUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LOGOS}`;

// 			try {
// 				// 3. Use the constructed URL in the fetch call
// 				const response = await fetch(logoUrl);
// 				const data = await response.json();

// 				if (data && data.logo_url) {
// 					setCompanyLogo({
// 						id: 1,
// 						name: footerData.companyName,
// 						logo: data.logo_url,
// 						uploaded_at: "",
// 					});
// 				}
// 			} catch (error) {
// 				console.error("Error fetching company logo:", error);
// 			} finally {
// 				setLogoLoading(false);
// 			}
// 		};

// 		fetchCompanyLogo();
// 	}, []);

// 	// 🔹 Handle logout
// 	const handleLogout = async () => {
// 		await dispatch(logout());
// 		dispatch(clearAuth()); // make sure store clears
// 		navigate("/");    // redirect to login page
// 	};
// 	const handlePrivacyPolicy = () => navigate(NAVIGATION_ROUTES.PRIVACY_POLICY);
// 	const handleTermsAndConditions = () => navigate(NAVIGATION_ROUTES.TERMS_AND_CONDITIONS);
// 	const handleVersionControl = () => navigate(NAVIGATION_ROUTES.VERSION_CONTROL);



// 	if (!isAuthenticated) {
// 		// Optionally redirect non-authenticated users
// 		navigate("/");
// 		return null;
// 	}

// 	const sizeClasses = {
// 		small: "text-sm px-2 py-1",
// 		medium: "text-base",
// 		large: "text-lg px-6 py-4",
// 	};

// 	return (
// 		<div className={`min-h-screen flex flex-col ${sizeClasses[size]} mt-5`}>
// 			{isAuthenticated && user && (
// 				<Navbar
// 					// user={mockUser} 
// 					user={user}
// 					onLogout={handleLogout}
// 					onPrivacyPolicy={handlePrivacyPolicy}
// 					onTermsAndConditions={handleTermsAndConditions}
// 					onVersionControl={handleVersionControl}
// 				/>
// 			)}

// 			<div className='pt-16 flex-grow'>
// 				<Outlet />
// 			</div>

// 			<Footer
// 				isLoading={logoLoading}
// 				logoUrl={companyLogo?.logo}
// 				companyName={footerData.companyName}
// 				companyUrl={footerData.companyUrl}
// 				tagline={footerData.tagline}
// 			/>
// 		</div>
// 	);
// };

// export default MainLayout;



// src/components/templates/MainLayout/MainLayout.tsx (or wherever your file is located)

import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from '../../organisms/Navbar/Navbar';
import { useEffect, useState } from "react";
import { Footer } from '../../organisms/Footer/Footer';
import { API_ENDPOINTS } from "../../constants/api";

// 🔹 Import Redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import { logout, clearAuth } from "../../hooks/useAuth";
import { NAVIGATION_ROUTES } from "../../constants/navigation";

// 🔹 IMPORT THE LOGO HERE
import NLlogo from '../../../assets/Images/nl_technologies_logo.png';

interface CompanyLogo {
  id: number;
  name: string;
  logo: string;
  uploaded_at: string;
}

type SizeOption = "small" | "medium" | "large";

interface MainLayoutProps {
  size?: SizeOption;
}

const MainLayout = ({ size = "medium" }: MainLayoutProps) => {
  const [companyLogo, setCompanyLogo] = useState<CompanyLogo | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // Get logged-in user from Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const footerData = {
    companyName: "NL Technologies Pvt.Ltd",
    companyUrl: "http://www.nltechnologies.com/", // Fixed typo in URL from your snippet
    tagline: "Empowering Industrial Excellence Through Digital Transformation",
  };

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      const logoUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LOGOS}`;

      try {
        const response = await fetch(logoUrl);
        const data = await response.json();

        if (data && data.logo_url) {
          setCompanyLogo({
            id: 1,
            name: footerData.companyName,
            logo: data.logo_url,
            uploaded_at: "",
          });
        }
      } catch (error) {
        console.error("Error fetching company logo:", error);
        // Note: We don't need to do anything here because we handle the fallback in the JSX below
      } finally {
        setLogoLoading(false);
      }
    };

    fetchCompanyLogo();
  }, []);

  // 🔹 Handle logout
  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearAuth());
    navigate("/");
  };
  
  const handlePrivacyPolicy = () => navigate(NAVIGATION_ROUTES.PRIVACY_POLICY);
  const handleTermsAndConditions = () => navigate(NAVIGATION_ROUTES.TERMS_AND_CONDITIONS);
  const handleVersionControl = () => navigate(NAVIGATION_ROUTES.VERSION_CONTROL);

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const sizeClasses = {
    small: "text-sm px-2 py-1",
    medium: "text-base",
    large: "text-lg px-6 py-4",
  };

  return (
    <div className={`min-h-screen flex flex-col ${sizeClasses[size]} mt-5`}>
      {isAuthenticated && user && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onVersionControl={handleVersionControl}
        />
      )}

      <div className='pt-16 flex-grow'>
        <Outlet />
      </div>

      <Footer
        isLoading={logoLoading}
        // 🔹 UPDATED: Use API logo if available, otherwise use local NLlogo
        logoUrl={companyLogo?.logo || NLlogo} 
        companyName={footerData.companyName}
        companyUrl={footerData.companyUrl}
        tagline={footerData.tagline}
      />
    </div>
  );
};

export default MainLayout;