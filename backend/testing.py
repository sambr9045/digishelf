import turtle

# Set up the screen
screen = turtle.Screen()
screen.bgcolor("red")

# Create a turtle for drawing
bird = turtle.Turtle()
bird.speed(5)  # Set the drawing speed

# Draw the body
bird.color("black", "yellow")  # Outline color, fill color
bird.begin_fill()
bird.circle(50)  # Body
bird.end_fill()

# Draw the head
bird.penup()
bird.setpos(25, 60)  # Position for the head
bird.pendown()
bird.color("black", "yellow")
bird.begin_fill()
bird.circle(20)  # Head
bird.end_fill()

# Draw the beak
bird.penup()
bird.setpos(45, 60)  # Position for the beak
bird.pendown()
bird.color("black", "orange")
bird.begin_fill()
bird.setheading(315)
bird.forward(25)
bird.left(120)
bird.forward(25)
bird.end_fill()

# Draw an eye
bird.penup()
bird.setpos(35, 80)  # Position for the eye
bird.pendown()
bird.dot(10, "black")

# Hide the turtle and display the result
bird.hideturtle()

# Keep the window open until it is closed by the user
turtle.done()
