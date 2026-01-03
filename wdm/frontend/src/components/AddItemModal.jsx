import { memo } from "react";
import { FiPlus } from "react-icons/fi";

const AddItemModal = ({ 
	showAddModal, 
	formData, 
	imageFile, 
	imagePreview, 
	submitting, 
	message, 
	handleChange, 
	handleSubmit, 
	handleImageUpload, 
	setShowAddModal 
}) => {
	if (!showAddModal) return null;

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0, 0, 0, 0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
				padding: "20px",
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					setShowAddModal(false);
				}
			}}
		>
			<div
				style={{
					background: "white",
					borderRadius: "16px",
					maxWidth: "800px",
					width: "100%",
					maxHeight: "90vh",
					overflowY: "auto",
					boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
				}}
			>
				{/* Header */}
				<div
					style={{
						padding: "24px 24px 0 24px",
						borderBottom: "1px solid #e5e7eb",
						marginBottom: "24px",
					}}
				>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
						<h2 className="heading-2" style={{ margin: 0 }}>Add New Item</h2>
						<button
							onClick={() => setShowAddModal(false)}
							style={{
								background: "none",
								border: "none",
								fontSize: "24px",
								cursor: "pointer",
								color: "#6b7280",
								padding: "4px",
							}}
						>
							×
						</button>
					</div>
				</div>

				{message && (
					<div className={`mb-6 animate-slide-up ${message.includes("success") ? "status-success" : "status-error"}`} style={{ margin: "0 24px" }}>
						{message}
					</div>
				)}

				<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start" style={{ padding: "0 24px 24px" }}>
					{/* Image Upload */}
					<div>
						<input 
							id="image-upload"
							type="file" 
							accept="image/*" 
							onChange={handleImageUpload} 
							style={{ display: 'none' }} 
						/>

						<div 
							onClick={() => document.getElementById('image-upload').click()}
							className={`rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${imagePreview ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
						>
							<div className="flex items-start gap-4">
								{/* Preview (fixed size, left-aligned) */}
								<div
									style={{
										width: "128px",
										height: "128px",
										overflow: "hidden",
										borderRadius: "12px",
										background: "#e5e7eb",
										flexShrink: 0,
									}}
								>
									{imagePreview ? (
										<img
											src={imagePreview}
											alt="Preview"
											style={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
												display: "block",
											}}
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<FiPlus className="text-gray-400" size={32} />
										</div>
									)}
								</div>

								{/* Details (right-aligned, takes remaining space) */}
								<div className="flex-1 text-left">
									<h4 className="font-semibold text-gray-900 mb-1">
										{imagePreview ? "Image uploaded" : "Upload image"}
									</h4>
									<p className="text-sm text-gray-500">
										{imagePreview ? "Click to change image" : "Click to browse or drag and drop"}
									</p>
									<p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						{/* Details Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="form-group">
								<label htmlFor="category" className="form-label">
									Category <span style={{ color: "#dc2626" }}>*</span>
								</label>
								<select id="category" name="category" value={formData.category} onChange={handleChange} className="input-field">
									<option value="">Select category</option>
									<option value="tops">Tops</option>
									<option value="bottoms">Bottoms</option>
									<option value="shoes">Shoes</option>
									<option value="sweaters">Sweaters</option>
									<option value="jackets">Jackets</option>
									<option value="accessories">Accessories</option>
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="price" className="form-label">
									Price <span style={{ color: "#dc2626" }}>*</span>
								</label>
								<input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" step="0.01" className="input-field" required />
							</div>

							<div className="form-group">
								<label htmlFor="brand" className="form-label">
									Brand
								</label>
								<input id="brand" name="brand" type="text" value={formData.brand} onChange={handleChange} placeholder="e.g. Nike, Zara" className="input-field" />
							</div>

							<div className="form-group">
								<label htmlFor="season" className="form-label">
									Season
								</label>
								<select id="season" name="season" value={formData.season} onChange={handleChange} className="input-field">
									<option value="">Select season</option>
									<option value="Spring">Spring</option>
									<option value="Summer">Summer</option>
									<option value="Fall">Fall</option>
									<option value="Winter">Winter</option>
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="size" className="form-label">
									Size
								</label>
								<input id="size" name="size" type="text" value={formData.size} onChange={handleChange} placeholder="e.g. M, 32, 10" className="input-field" />
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
						<button
							type="button"
							onClick={() => setShowAddModal(false)}
							className="btn-secondary"
							style={{ padding: "12px 24px" }}
							disabled={submitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn-primary"
							style={{ padding: "12px 24px" }}
							disabled={submitting}
						>
							{submitting ? "Adding..." : "Add Item"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default memo(AddItemModal);