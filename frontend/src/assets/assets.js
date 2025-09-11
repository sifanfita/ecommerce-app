import crossIcon from './cross icon.png';
import Logo from './logo.png';
import downArrow from './down-arrow.png';
import exchange from './exchange.png';
import menJacket1 from './menjacket1.jpg';
import menJacket2 from './menjacket2.jpg';
import menJacket3 from './menjacket3.jpg';
import MenShirt1 from './Menshirt1.jpg';
import menShirt2 from './menshirt2.jpg';
import menShirt3 from './menshirt3.jpg';
import menShoes1 from './menshoes1.jpg';
import menShoes2 from './menshoes2.jpg';
import menShoes3 from './menshoes3.jpg';
import menStuta1 from './menstuta1.jpg';
import menTrouser1 from './mentrouser1.jpg';
import menTrouser2 from './mentrouser2.jpg';
import menTrouser3 from './mentrouser3.jpg';
import menTShirt1 from './mentshirt1.jpg';
import menTShirt2 from './mentshirt2.jpg';
import menTShirt3 from './mentshirt3.jpg';
import menuIcon from './menu.png';
import shoppingBag from './shopping-bag.png';
import trashBin from './trash-bin.png';
import searchIcon from './searchicon.png';
import profileIcon from './profileicon.png';
import heroImage from './heroimage.jpg';
import supportIcon from './supporticon.png';
import qualityIcon from './qualityicon.png';

export const assets = {
  crossIcon,
  Logo,
  downArrow,
  exchange,
  menJacket1,
  menJacket2,
  menJacket3,
  MenShirt1,
  menShirt2,
  menShirt3,
  menShoes1,
  menShoes2,
  menShoes3,
  menStuta1,
  menTrouser1,
  menTrouser2,
  menTrouser3,
  menTShirt1,
  menTShirt2,
  menTShirt3,
  menuIcon,
  shoppingBag,
  trashBin,
  searchIcon,
  profileIcon,
  heroImage,
  qualityIcon,
  supportIcon,
};

export const products = [
    {
        _id: 1,
        name: 'Classic Denim Jacket',
        description: 'Timeless denim jacket with a regular fit and durable stitching.',
        price: 120,
        image: [menJacket1],
        category: 'Jacket',
        sizes: ['S', 'M', 'L', 'XL'],
        date: 1725148800,
        bestSeller: true,
    },
    {
        _id: 2,
        name: 'Puffer Winter Jacket',
        description: 'Warm puffer jacket with lightweight insulation and water-resistant shell.',
        price: 180,
        image: [menJacket2],
        category: 'Jacket',
        sizes: ['M', 'L', 'XL'],
        date: 1725926400,
        bestSeller: false,
    },
    
    {
        _id: 3,
        name: 'Leather Biker Jacket',
        description: 'Premium faux-leather biker jacket with zip details and tailored cut.',
        price: 210,
        image: [menJacket3],
        category: 'Jacket',
        sizes: ['S', 'M', 'L'],
        date: 1726617600,
        bestSeller: true,
    },
    {
        _id: 4,
        name: 'Oxford Shirt',
        description: 'Smart casual oxford shirt, breathable cotton with a clean finish.',
        price: 65,
        image: [MenShirt1],
        category: 'Shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        date: 1724284800,
        bestSeller: false,
    },
    {
        _id: 5,
        name: 'Slim Fit Shirt',
        description: 'Slim-fit long sleeve shirt for everyday office wear.',
        price: 59,
        image: [menShirt2],
        category: 'Shirt',
        sizes: ['M', 'L', 'XL'],
        date: 1724803200,
        bestSeller: true,
    },
    {
        _id: 6,
        name: 'Casual Check Shirt',
        description: 'Soft cotton check shirt with button-down collar.',
        price: 62,
        image: [menShirt3],
        category: 'Shirt',
        sizes: ['S', 'M', 'L'],
        date: 1725494400,
        bestSeller: false,
    },
    {
        _id: 7,
        name: 'Graphic T-shirt',
        description: 'Comfortable crew-neck tee with minimal graphic print.',
        price: 30,
        image: [menTShirt1],
        category: 'T-shirt',
        sizes: ['S', 'M', 'L', 'XL'],
        date: 1722297600,
        bestSeller: true,
    },
    {
        _id: 8,
        name: 'Essential Cotton T-shirt',
        description: 'Everyday soft cotton tee with a regular fit.',
        price: 25,
        image: [menTShirt2],
        category: 'T-shirt',
        sizes: ['M', 'L', 'XL'],
        date: 1722556800,
        bestSeller: false,
    },
    {
        _id: 9,
        name: 'Athletic Fit T-shirt',
        description: 'Moisture-wicking athletic tee for workouts and casual wear.',
        price: 28,
        image: [menTShirt3],
        category: 'T-shirt',
        sizes: ['S', 'M', 'L'],
        date: 1723248000,
        bestSeller: true,
    },
    {
        _id: 10,
        name: 'Chino Trousers',
        description: 'Classic chinos with stretch for comfort and movement.',
        price: 75,
        image: [menTrouser1],
        category: 'Trouser',
        sizes: ['30', '32', '34', '36'],
        date: 1725321600,
        bestSeller: false,
    },
    {
        _id: 11,
        name: 'Slim Fit Trousers',
        description: 'Slim-fit trousers with tapered leg and sharp silhouette.',
        price: 80,
        image: [menTrouser2],
        category: 'Trouser',
        sizes: ['30', '32', '34'],
        date: 1726099200,
        bestSeller: true,
    },
    {
        _id: 12,
        name: 'Casual Drawstring Trousers',
        description: 'Relaxed-fit trousers with drawstring waist for everyday wear.',
        price: 65,
        image: [menTrouser3],
        category: 'Trouser',
        sizes: ['S', 'M', 'L', 'XL'],
        date: 1726790400,
        bestSeller: false,
    },
    {
        _id: 13,
        name: 'Running Shoes',
        description: 'Lightweight running shoes with breathable mesh upper.',
        price: 95,
        image: [menShoes1],
        category: 'Shoes',
        sizes: ['40', '41', '42', '43', '44'],
        date: 1722816000,
        bestSeller: true,
    },
    {
        _id: 14,
        name: 'Casual Sneakers',
        description: 'Everyday sneakers with cushioned sole and clean profile.',
        price: 85,
        image: [menShoes2],
        category: 'Shoes',
        sizes: ['40', '41', '42', '43'],
        date: 1723680000,
        bestSeller: false,
    },
    {
        _id: 15,
        name: 'High-Top Trainers',
        description: 'High-top shoes for style and ankle support.',
        price: 99,
        image: [menShoes3],
        category: 'Shoes',
        sizes: ['41', '42', '43', '44'],
        date: 1724544000,
        bestSeller: true,
    },
    {
        _id: 16,
        name: 'Sport Tuta Set',
        description: 'Two-piece athletic tuta set with breathable fabric.',
        price: 120,
        image: [menStuta1],
        category: 'Tuta',
        sizes: ['S', 'M', 'L', 'XL'],
        date: 1725753600,
        bestSeller: false,
    },
];


  


