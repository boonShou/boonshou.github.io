# BOON_SHOUNG.github.io
My personal portfolio

## Project Images Workflow

For the project images in my portfolio, I have decided to use local image hosting directly on GitHub.
The workflow is as follows:

1. All project images are manually uploaded to the `images/` folder inside my GitHub repository (`boonshou.github.io/images/`)
2. When adding a project through the Admin Panel, I type the relative image path (e.g. `images/project1.jpg`) into the image field
3. The portfolio website then loads the image directly from the GitHub repository

This approach was chosen because:
- **Free** — no third party image hosting service required
- **Reliable** — images are stored in the same repository as the website, so they will never break or disappear
- **Simple** — no external dependencies or API keys needed
- **Version controlled** — all images are tracked by Git, so changes can be monitored

**Limitation**: Images cannot be uploaded automatically through the admin panel, as GitHub Pages is a static hosting service that does not support server-side file writing. Therefore, images must be manually uploaded to the repository first before being referenced in the admin panel.
