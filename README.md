# get_swift

## How did you implement your solution?

I built out my solution as a full stack app.  While the assignment didn't strictly call for it, it's mostly templated anyway, plus I figured it would be useful to display the results with a simple front end view.

To start, I created a model (service) that integrated the API provided, and used simple axios "get" requests to pull in the random data.  In my main index.js file, I set up express and mustache to handle the server calls and display.  I also utilized pg-promise in my models in order to make sure all server calls were complete before loading the page.

Once the framework was all set up, I first pulled in a function that would calculate distance between two coordinates, in order to determine how far each drone would have to go to drop off its current package (if it had one) and get back to the depot.  Using this distance, I sorted the array of drones by distance travelled, in order to rank which drones would get back to the depot quickest, and in what order.  Simultaneously, I sorted the packages based on delivery deadline, so as to process the most urgent ones first.

Once these were sorted, I paired the 2 arrays up until either there were no more packages or no more drones left, whichever came first.  Essentially, the first drone that comes back to the depot picks up the most urgent package, and so on down the line.  The drone/package pairs were then stored as objects in an array, along with an array of any unclaimed packages.  These were then rendered in a view, using mustache.

## Why did you implement it this way?

I implemented the framework this way because I am comfortable with an MVC framework using Node.js/Express.

As for the actual output, this seemed to be the best start towards automating a system that would optimize delivery time.  While the package delivery is based on deadline, rather than distance, I assume someone would rather get a delivery late, rather than not at all.  If building out a full system (which is what you guys do), there would need to be lots of other logic checks and algorithm adjustments to fully optimize it.  For instance, it might make sense for one delivery to be very late, while still fulfilling the rest on time, rather than letting all the deliveries be just a little late.  It all depends on what is prioritized.

## Let's assume we need to handle dispatching thousands of jobs per second to thousands of drivers. Would the solution you've implemented still work? Why or why not? What would you modify? Feel free to describe a completely different solution than the one you've developed.

My solution should work as a starting point.  You'd need to add in a lot more variables and constraints to deploy in the real world.  For instance, if you're not using a drone, you have to take into account roads, traffic, weather, etc.  Even if you are using a drone, there's a non-zero amount of time spent actually dropping off the package, plus battery charging and other factors.  In addition, you'd have to build priorities into the code, as mentioned above.  There is a degree of human preference that will optimize the algorithm.

Most crucially, my algorithm would need to be a recurring function.  What I wrote only accounts for one iteration of packages being processed.  In the real world, a delivery list is constantly being updated, so there would need to be a way to keep calling the function on a set interval.  In addition, you would need to then re-assign each drone/driver after each delivery is complete.  There would have to be something listening to confirm a delivery has been completed, which would then push the drone/driver back in queue as being available.  There's certainly plenty of other factors I am not considering as well, but I believe I have laid the groundwork for how one might set up a system like this.