import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products, getRecommendedProducts } from '@/data/productData';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ArrowLeft } from 'lucide-react';
import { CartItemQuantity } from '@/components/ShoppingCart';

const randomDetails = [
	{ label: 'Weight', value: '250g' },
	{ label: 'Origin', value: 'Nepal' },
	{ label: 'Organic', value: 'Yes' },
	{ label: 'Shelf Life', value: '12 months' },
	{ label: 'Germination Rate', value: '95%' },
	{ label: 'Best Season', value: 'Spring' },
	{ label: 'Storage', value: 'Cool, dry place' },
	{ label: 'Certification', value: 'NASC Certified' },
];

const ProductDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { addItem, items, openCart, removeItem } = useCart();
	const product = products.find(p => p.id === Number(id));
	const cartItem = items.find(item => item.id === Number(id));

	// Add this state for recommended product quantities
	const [recQuantities, setRecQuantities] = React.useState<{ [id: number]: number }>({});

	const recommended = useMemo(() => {
		if (!product) return [];
		return getRecommendedProducts(product.id, product.category, 4);
	}, [product]);

	const details = useMemo(() => {
		return randomDetails.sort(() => 0.5 - Math.random()).slice(0, 4);
	}, [id]);

	React.useEffect(() => {
		// Scroll to top when navigating to a new product
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [id]);

	// Add to cart handler for main product
	const handleAddToCart = () => {
		if (product && product.inStock) {
			addItem(product);
		}
	};

	// Remove from cart handler for main product
	const handleRemoveFromCart = () => {
		if (product && cartItem && cartItem.quantity > 0) {
			removeItem(product.id);
		}
	};

	// Handler for adding recommended product to cart
	const handleRecAddToCart = (rp: typeof product) => {
		if (rp && rp.inStock) {
			const qty = recQuantities[rp.id] || 1;
			for (let i = 0; i < qty; i++) {
				addItem(rp);
			}
		}
	};

	if (!product) {
		return (
			<div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
				<h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
				<Button onClick={() => navigate(-1)} className="mt-4">
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full min-h-[100vh] bg-gradient-to-br from-[#10141E] to-[#232B3B] flex flex-col items-center py-0 px-0">
			{/* Top Bar */}
			<div className="flex items-center gap-2 w-full max-w-5xl px-4 md:px-8 pt-8 pb-3">
				<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
					<ArrowLeft size={20} />
				</Button>
				<span className="text-base md:text-lg font-semibold text-gray-300">Back</span>
			</div>
			{/* Main Product Section - more compact, with padding and spacing */}
			<div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 md:gap-10 px-4 md:px-8 py-6 md:py-8">
				{/* Image */}
				<div className="flex-shrink-0 w-full md:w-[340px] h-[220px] md:h-[340px] flex items-center justify-center bg-[#181F2C] rounded-xl shadow relative">
					<span className="text-6xl md:text-7xl text-gray-600 font-extrabold select-none opacity-20 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
						{product.name[0]}
					</span>
					<img
						src={'/placeholder.svg'}
						alt={product.name}
						className="w-3/5 h-3/5 object-contain z-10 relative drop-shadow"
					/>
				</div>
				{/* Info */}
				<div className="flex-1 flex flex-col justify-between">
					<div>
						<h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-cropsay-green drop-shadow leading-tight">
							{product.name}
						</h1>
						<div className="flex flex-wrap items-center gap-2 mb-4">
							<span className="text-yellow-400 font-semibold flex items-center gap-1 text-base">
								★ {product.rating}
							</span>
							<span className="text-xs bg-[#1E2735] border border-[#2A3143] px-3 py-0.5 rounded-full uppercase tracking-wide">
								{product.category}
							</span>
							<span className="text-xs bg-[#1E2735] border border-[#2A3143] px-3 py-0.5 rounded-full uppercase tracking-wide">
								{product.subcategory}
							</span>
							<span className="text-xs bg-[#1E2735] border border-[#2A3143] px-3 py-0.5 rounded-full uppercase tracking-wide">
								{product.brand}
							</span>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 mt-2">
							{details.map((d, i) => (
								<div
									key={i}
									className="flex flex-col bg-[#181F2C] rounded-lg p-3 border border-[#232B3B] min-w-[90px]"
								>
									<span className="text-xs text-gray-400 mb-0.5">
										{d.label}
									</span>
									<span className="font-semibold text-gray-100 text-base">
										{d.value}
									</span>
								</div>
							))}
						</div>
						<p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed border-l-4 border-cropsay-green pl-4 bg-[#181F2C]/40 py-2">
							{product.description} <br />
							This premium quality product is carefully selected and tested for best results. Perfect for home gardeners and professionals alike. Enjoy high germination rates and robust growth. Order now for fast delivery and expert support!
						</p>
						<div className="flex items-center gap-4 mb-6">
							<span className="text-2xl font-bold text-green-400">
								रु {product.price}
							</span>
							<span
								className={`text-lg font-medium ${product.inStock ? 'text-green-500' : 'text-red-500'}`}
							>
								{product.inStock ? 'In Stock' : 'Out of Stock'}
							</span>
						</div>
					</div>
					<div className="flex gap-4 mt-2 items-center">
						{/* Consistent quantity selector for main product */}
						{cartItem && cartItem.quantity > 0 ? (
							<CartItemQuantity id={product.id} quantity={cartItem.quantity} />
						) : (
							<Button
								className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-3 rounded-lg shadow font-semibold"
								disabled={!product.inStock}
								onClick={handleAddToCart}
							>
								Add to Cart
							</Button>
						)}
						<Button
							variant="outline"
							className="text-lg px-8 py-3 rounded-lg border-gray-500 font-semibold"
							onClick={openCart}
						>
							View Cart
						</Button>
					</div>
				</div>
			</div>
			{/* Similar Products Section - full width, compact */}
			<div className="w-full max-w-5xl px-4 md:px-8 pb-12 pt-8">
				<h2 className="text-2xl md:text-3xl font-bold mb-6 text-cropsay-green">
					Similar Products
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
					{recommended.length === 0 && (
						<div className="col-span-full text-gray-400 text-center">
							No similar products found.
						</div>
					)}
					{recommended.map(rp => (
						<div
							key={rp.id}
							className="bg-[#181F2C] rounded-xl p-4 shadow hover:shadow-xl transition cursor-pointer flex flex-col items-center group border border-[#232B3B] hover:border-cropsay-green relative"
							onClick={e => {
								if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
								window.scrollTo({ top: 0 }); // scroll immediately before navigation
								navigate(`/shop/product/${rp.id}`);
							}}
						>
							<div className="w-16 h-16 bg-[#232B3B] rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
								<span className="text-2xl text-gray-500 font-extrabold select-none opacity-30 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
									{rp.name[0]}
								</span>
								<img
									src={'/placeholder.svg'}
									alt={rp.name}
									className="w-3/5 h-3/5 object-contain z-10 relative"
								/>
							</div>
							<h3 className="font-semibold text-base text-center group-hover:text-cropsay-green transition-colors mb-1">
								{rp.name}
							</h3>
							<div className="flex items-center gap-2 text-sm mb-1">
								<span className="text-yellow-400">★ {rp.rating}</span>
								<span className="text-gray-400">रु {rp.price}</span>
							</div>
							<span
								className={`text-xs px-2 py-0.5 rounded-full ${rp.inStock ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}
							>
								{rp.inStock ? 'In Stock' : 'Out of Stock'}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProductDetailPage;
