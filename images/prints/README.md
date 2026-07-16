# Drop all 3D print photos here

Add your images to this folder (`images/prints/`). Subfolders are OK.

**Supported:** JPG, PNG, WebP, GIF

**No manual listing needed.** After adding images, run:

```bash
npm run build
```

This scans every image, reads its aspect ratio, and builds the masonry portfolio grid automatically. The hero background also rotates through your first 5 images.

Then commit and push — GitHub Actions rebuilds on deploy.
