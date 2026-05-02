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

## Dynamic Media Links System

For each project in my portfolio, I have implemented a dynamic media links system that is fully controlled through the Admin Panel.

### 🖼️ Multi-Image Gallery & Lightbox
Projects now support an unlimited number of additional images, displayed in a beautiful grid on the project detail page.
- **Lightbox**: All images are clickable. When clicked, they open in a premium, full-screen viewer with a blurred background.
- **Admin Usage**: In the project modal, click "Add Image Path" to add rows for additional relative paths (e.g., `images/gallery1.jpg`).
- **Data Format**: Additional images are stored as a pipe-delimited string (`path1|path2|path3`) in Column I of the Google Sheet.

### 🔗 Dynamic Media Links
Each project card and detail page displays social/demo links as recognizable icon buttons.
- **Supported Types**: GitHub, Live Demo, YouTube, LinkedIn, Website, and Other.
- **Storage**: Links are stored as `type:URL|type:URL` in Column H.

### How it appears on the portfolio:
- Each project card displays the media links as icon buttons using recognisable logos (GitHub logo, globe icon for Live Demo, YouTube icon, LinkedIn icon etc.).
- Clicking an icon button opens the link in a new tab.
- Only the links added by the admin will be shown — no empty or broken buttons.

### How it is stored:
- All media links are stored in a dedicated `media` column in the Google Sheets database.
- The data is stored in a structured format e.g. `github:URL|youtube:URL|demo:URL`.
- The frontend JavaScript parses this data and automatically renders the correct icon for each link type.

This approach gives full flexibility to showcase different types of projects — some may have only a GitHub link, while others may have a live demo, YouTube video, and LinkedIn post all at once.
