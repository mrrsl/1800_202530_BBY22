# Planaria (Working Name)


## Overview
A planner with customization features and tracking to-do lists of other people in your social circle.

---


## Features

- Change colors and font styles for the interface
- Make todo lists that can be followed by other people
- See who's completed the most tasks

---


## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---


## Usage

1. Open your browser and visit `http://localhost:3000`.
2. Browse the list of hiking trails displayed on the main page.
3. Click the heart icon (or similar) to mark a trail as a favorite.
4. View your favorite hikes in the favorites section.

---


## Project Structure

```
planaria/
├── src/
│   └── main.js
├── styles/
│   └── style.css
├── public/
	├── icons
	└── backgrounds
├── images/
├── index.html
├── package.json
├── README.md
```

---


## Contributors
- **Sofia** - BCIT CST Student with a passion for design, reading, and music :P Fun fact about me: I love sci-fi novels & Depeche Mode!
- **Kian Castro** BCIT CST Student with a passion for learning. Fun fact: Loves solving Rubik's Cubes in around 2 minutes and 30 seconds.
- **Morris Li** BCIT CST Student living and breathing number puzzles.




## Acknowledgments

- Trail data and images are for demonstration purposes only.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Unsplash](https://unsplash.com/).

---


## Limitations and Future Work
### Limitations

- Only landing page is present

### Future Work

- Implement the rest

---

## Implementation Notes
### Firestore Schemes
##### `users`Collection
```ts
users = [
	userId: {
		// Collection of other userIds
		friends: Array<Number|string>,
		name: string,
		completions: Number
	}
]
```
#### Task Collections
Stores both personal and shared tasks collections.
###### `shared-tasks`collection
```ts
shared_task = [
	userId: {
		friends: [
			userId1,
			userId2
		],
		task: {
			date: Date,
			title: string,
			desc: string
		}
	}
]
```
###### `personal-tasks`collection
```ts
personal_task = [
	userId: {
		// Document ID will take the form {YYYYMMDD}{title}
		tasks: [
			{
				date: Date,
				title: string,
				desc: string
			}
		]
	}
]
```
---


## License

This project is licensed under the MIT License. See the LICENSE file for details.
