import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
	const { user, logout, isAdmin } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const navItems = [
		{ path: "/outfit-maker", label: "Outfit Maker" },
		{ path: "/dashboard", label: "Wardrobe" },
	];

	// Add admin navigation items if user is admin
	const adminNavItems = isAdmin ? [
		{ path: "/admin/dashboard", label: "Admin Panel" }
	] : [];

		return (
		<nav style={{ 
			backgroundColor: "white", 
			borderBottom: "1px solid #e5e7eb",
			padding: "1rem 0",
			position: "sticky",
			top: 0,
			zIndex: 100
		}}>
			<div className="nav-content">
				<div style={{ 
					display: "flex", 
					alignItems: "center", 
					justifyContent: "space-between" 
				}}>
					<div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
						<h1 style={{ 
							fontSize: "1.5rem", 
							fontWeight: "600", 
							color: "#111827",
							margin: 0
						}}>
							Fitfolio
						</h1>
						<div style={{ display: "flex", gap: "1rem" }}>
							{[...navItems, ...adminNavItems].map((item) => (
								<button
									key={item.path}
									onClick={() => navigate(item.path)}
									style={{
										padding: "0.5rem 1rem",
										backgroundColor: location.pathname === item.path ? 
											(item.path.startsWith('/admin') ? "#dc2626" : "#3b82f6") : "transparent",
										color: location.pathname === item.path ? "white" : "#6b7280",
										border: location.pathname === item.path ? "none" : "1px solid #d1d5db",
										borderRadius: "0.5rem",
										fontSize: "0.875rem",
										fontWeight: "500",
										cursor: "pointer",
										transition: "all 200ms ease-in-out",
									}}
								>
									{item.label}
								</button>
							))}
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						<div style={{ textAlign: "right" }}>
							<p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
								{isAdmin ? "Admin" : "Welcome"}
							</p>
							<p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827", margin: 0 }}>
								{user?.name} {isAdmin && "🛡️"}
							</p>
						</div>
						<button
							onClick={handleLogout}
							style={{
								padding: "0.5rem 1rem",
								backgroundColor: "transparent",
								color: "#6b7280",
								border: "1px solid #d1d5db",
								borderRadius: "0.5rem",
								fontSize: "0.875rem",
								fontWeight: "500",
								cursor: "pointer",
								transition: "all 200ms ease-in-out",
							}}
						>
							Logout
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;