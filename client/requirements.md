## Packages
framer-motion | Page transitions and animations
qrcode.react | Rendering QR codes on the client side
react-dropzone | File upload handling
lucide-react | Icons (already in base but essential)
zod | Schema validation (already in base)
react-hook-form | Form handling
@hookform/resolvers | Zod resolver for forms

## Notes
The application uses a hybrid menu system: Image vs Digital.
The public route `/menu/:slug` must be responsive and accessible without auth.
Admin routes require authentication.
Images will use Unsplash placeholders for the MVP if no URL is provided.
