import React,{useEffect,useState} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarPage=()=>{

const [events,setEvents]=useState([]);
const [hoverData,setHoverData]=
useState(null);

const [mousePos,setMousePos]=
useState({
x:0,
y:0
});

useEffect(()=>{

loadCalendar();

},[]);

const loadCalendar=async()=>{

try{

const res=await api.get("/calendar");

console.log("API DATA:",res.data);

const temp=[];

res.data.forEach(item=>{

if(item.delivery_date){

temp.push({

title:"📦 Delivery",

extendedProps:{
customer:item.customer_name,
size:item.size,
booking:item.booking_id,
delivery:item.delivery_date,
collection:item.collection_date
},

start:
new Date(item.delivery_date),

allDay:true

});

}

if(item.collection_date){

temp.push({

title:"🚚 Collection",

extendedProps:{
customer:item.customer_name,
size:item.size,
booking:item.booking_id,
delivery:item.delivery_date,
collection:item.collection_date
},

start:
new Date(item.collection_date),

allDay:true

});

}

});

console.log("EVENTS:",temp);

setEvents(temp);

}
catch(err){

console.log(err);

}

};

return(

<DashboardLayout>

<div className="page-header">

<h1>
Calendar
</h1>

<p>
View deliveries and collections.
</p>

</div>

<div className="pricing-card">

<h3>
Total Events: {events.length}
</h3>

<br/>
<FullCalendar

plugins={[
dayGridPlugin,
timeGridPlugin,
interactionPlugin
]}

initialView="dayGridMonth"
buttonText={{
    today: "Today"
  }}
headerToolbar={{
left:"prev,next",
center:"title",
right:"today"
}}

events={events}

eventContent={(eventInfo)=>{

return(

<div
style={{
fontSize:"16px",
textAlign:"center"
}}
>
{
eventInfo.event.title.includes("Delivery")
? "📦 Delivery"
: "🚚 Collection"
}
</div>

);

}}
eventMouseEnter={(info)=>{

setHoverData({

customer:
info.event.extendedProps.customer,

size:
info.event.extendedProps.size,

booking:
info.event.extendedProps.booking,

delivery:
info.event.extendedProps.delivery,

collection:
info.event.extendedProps.collection,

type:
info.event.title

});

setMousePos({

x:info.jsEvent.pageX,

y:info.jsEvent.pageY

});

}}

eventMouseLeave={()=>{

setHoverData(null);

}}
height="750px"

/>

{
hoverData &&

<div className="calendar-modal">

<div className="calendar-modal-card">

<div className="event-badge">

{hoverData.type.includes("Delivery")
? "📦 Delivery"
: "🚚 Collection"}

</div>

<div className="event-details">

<div className="detail-row">

<span>
👤 Customer
</span>

<strong>
{hoverData.customer}
</strong>

</div>

<div className="detail-row">

<span>
🗑️ Bin Size
</span>

<strong>
{hoverData.size}
</strong>

</div>

<div className="detail-row">

<span>
📋 Booking ID
</span>

<strong>
#{hoverData.booking}
</strong>

</div>

<div className="detail-row">

<span>
📦 Delivery
</span>

<strong>
{new Date(
hoverData.delivery
).toLocaleDateString()}
</strong>

</div>

<div className="detail-row">

<span>
🚚 Collection
</span>

<strong>
{new Date(
hoverData.collection
).toLocaleDateString()}
</strong>

</div>

</div>

</div>

</div>
}

</div>

</DashboardLayout>

);

};

export default CalendarPage;