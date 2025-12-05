import { defineConfig } from 'vite'
import path from 'path';

const projectRoot = path.join(process.cwd(), "src");
const publicLocation = path.resolve(projectRoot, "..", "public");
export default defineConfig({
    root: projectRoot,
    publicDir: publicLocation,
    envDir: "../",
    build: {
        rollupOptions: {
            input: {
                index: path.join(projectRoot, "index.html"),
                login: path.join(projectRoot, "loginpage.html"),
                signup: path.join(projectRoot, "signuppage.html"),
                sofiascalendar: path.join(projectRoot, "calendar.html"),
                friends: path.join(projectRoot, "friends.html"),
                settings: path.join(projectRoot, "settings.html"),
                groupweeklyview: path.join(projectRoot, "groupweeklyview.html"),
                edit: path.join(projectRoot, "edit.html"),
                groupedit: path.join(projectRoot, "groupedit.html"),
                weeklyview: path.join(projectRoot, "weeklyview.html"),
                groups: path.join(projectRoot, "groups.html")
            }
        },
        outDir: "../dist"
    }
});
