const API_URL = "https://netflix-customer-churn-engagement.onrender.com/predict";
const form = document.getElementById("predictionForm");
const probability = document.getElementById("probability");
const probabilityBar = document.getElementById("probabilityBar");
const resultText = document.getElementById("resultText");
const resultSubtext = document.getElementById("resultSubtext");
const predictionValue = document.getElementById("predictionValue");
const resultBadge = document.getElementById("resultBadge");
const apiStatus = document.getElementById("apiStatus");
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll",()=>{const h=document.documentElement.scrollHeight-window.innerHeight;scrollProgress.style.width=`${h>0?(window.scrollY/h)*100:0}%`;});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
function getFormPayload(){const d=new FormData(form);return{age:Number(d.get("age")),gender:d.get("gender"),subscription_type:d.get("subscription_type"),watch_hours:Number(d.get("watch_hours")),last_login_days:Number(d.get("last_login_days")),region:d.get("region"),device:d.get("device"),monthly_fee:Number(d.get("monthly_fee")),payment_method:d.get("payment_method"),number_of_profiles:Number(d.get("number_of_profiles")),avg_watch_time_per_day:Number(d.get("avg_watch_time_per_day")),favorite_genre:d.get("favorite_genre")};}
function setLoadingState(on){const b=form.querySelector(".submit-btn");if(on){b.disabled=true;b.innerHTML="Running model <span>•••</span>";apiStatus.classList.remove("error");apiStatus.innerHTML="<i></i> Sending request";}else{b.disabled=false;b.innerHTML="Run prediction <span>→</span>";}}
function showResult(data){const risk=Number(data.prediction)===1;const p=Number(data.churn_probability)*100;probability.innerHTML=`${p.toFixed(1)}<small>%</small>`;probabilityBar.style.width=`${Math.min(Math.max(p,0),100)}%`;predictionValue.textContent=risk?"1 — Churn":"0 — No churn";resultBadge.textContent=risk?"HIGH RISK":"LOW RISK";resultBadge.className=`result-badge ${risk?"risk":"safe"}`;resultText.textContent=data.result||(risk?"Customer is likely to churn.":"Customer is unlikely to churn.");resultSubtext.textContent=risk?"The model detected a higher probability of churn. This can be used as a retention signal.":"The model detected a lower probability of churn for this customer profile.";apiStatus.classList.remove("error");apiStatus.innerHTML="<i></i> API response received";}
function showError(error){console.error(error);resultBadge.textContent="API ERROR";resultBadge.className="result-badge risk";resultText.textContent="Prediction unavailable";resultSubtext.textContent="Check that FastAPI is running and that the endpoint matches API_URL in script.js.";apiStatus.classList.add("error");apiStatus.innerHTML="<i></i> API connection failed";probability.innerHTML="—<small>%</small>";probabilityBar.style.width="0%";predictionValue.textContent="—";}
form.addEventListener("submit",async e=>{e.preventDefault();setLoadingState(true);try{const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(getFormPayload())});const data=await response.json();if(!response.ok)throw new Error(data.detail||"Prediction request failed.");showResult(data);}catch(err){showError(err);}finally{setLoadingState(false);}});
