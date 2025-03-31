"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Settings,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  Database,
  AlertCircle,
  Home,
  Users,
  Bot,
  Cloud,
  Activity
} from "lucide-react";
import { useTranslations } from 'next-intl';
import LocaleSwitcher from "../components/LocaleSwitcher";

export default function AdminPanel({ }) {
  // const t = useTranslations();
  const commonT = useTranslations('common');
  const navT = useTranslations('navigation');
  const dashT = useTranslations('dashboard');
  const userT = useTranslations('userMenu');
  const noticeT = useTranslations('systemNotice');

  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="drawer lg:drawer-open bg-base-200 min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col p-4">
        {/* Top navbar */}
        <div className="navbar bg-base-100 rounded-box mb-4 shadow-md">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold px-4 text-primary">{commonT('appName')} Panel</h1>
          </div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img alt="Admin avatar" src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a>{userT('profile')}</a></li>
                <li><a>{userT('settings')}</a></li>
                <li><a>{userT('logout')}</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col gap-6">
          {activeTab === "dashboard" && (
            <>
              <h2 className="text-2xl font-bold text-primary">{dashT('title')}</h2>

              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stats shadow bg-primary text-primary-content">
                  <div className="stat">
                    <div className="stat-title">{dashT('stats.tasksProcessedToday')}</div>
                    <div className="stat-value">89</div>
                    <div className="stat-desc">{dashT('stats.moreFromYesterday')}</div>
                  </div>
                </div>
                <div className="stats shadow bg-accent text-accent-content">
                  <div className="stat">
                    <div className="stat-title">{dashT('stats.processingQueue')}</div>
                    <div className="stat-value">12</div>
                    <div className="stat-desc">{dashT('stats.awaitingProcessing')}</div>
                  </div>
                </div>
                <div className="stats shadow bg-secondary text-secondary-content">
                  <div className="stat">
                    <div className="stat-title">{dashT('stats.apiCallsToday')}</div>
                    <div className="stat-value">324</div>
                    <div className="stat-desc">{dashT('stats.llmCalls')}</div>
                  </div>
                </div>
                <div className="stats shadow bg-neutral text-neutral-content">
                  <div className="stat">
                    <div className="stat-title">{dashT('stats.successRate')}</div>
                    <div className="stat-value">98.5%</div>
                    <div className="stat-desc">{dashT('stats.increaseRate')}</div>
                  </div>
                </div>
              </div>

              {/* Live task status */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title flex justify-between text-secondary">
                    {dashT('liveStatus.title')}
                    <div className="badge badge-success gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                      </span>
                      {dashT('liveStatus.active')}
                    </div>
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>{dashT('liveStatus.table.id')}</th>
                          <th>{dashT('liveStatus.table.taskType')}</th>
                          <th>{dashT('liveStatus.table.agronomist')}</th>
                          <th>{dashT('liveStatus.table.status')}</th>
                          <th>{dashT('liveStatus.table.time')}</th>
                        </tr>
                      </thead>
                      <tbody className="text-base-content">
                        <tr>
                          <td>T-2458</td>
                          <td>{dashT('liveStatus.table.cropAnalysis')}</td>
                          <td>Elena V.</td>
                          <td><span className="badge badge-success">{dashT('liveStatus.table.completed')}</span></td>
                          <td>2 min ago</td>
                        </tr>
                        <tr>
                          <td>T-2457</td>
                          <td>{dashT('liveStatus.table.soilTesting')}</td>
                          <td>Mikhail K.</td>
                          <td><span className="badge badge-info">{dashT('liveStatus.table.processing')}</span></td>
                          <td>5 min ago</td>
                        </tr>
                        <tr>
                          <td>T-2456</td>
                          <td>{dashT('liveStatus.table.pestIdentification')}</td>
                          <td>Sergei P.</td>
                          <td><span className="badge badge-warning">{dashT('liveStatus.table.waiting')}</span></td>
                          <td>12 min ago</td>
                        </tr>
                        <tr>
                          <td>T-2455</td>
                          <td>{dashT('liveStatus.table.irrigationAnalysis')}</td>
                          <td>Anna D.</td>
                          <td><span className="badge badge-error">{dashT('liveStatus.table.failed')}</span></td>
                          <td>25 min ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-primary-content">{dashT('liveStatus.autoRefresh')} <span className="font-bold">{dashT('liveStatus.seconds')}</span></div>
                    <progress className="progress progress-primary w-56" value="70" max="100"></progress>
                  </div>
                </div>
              </div>

              {/* Daily progress */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-secondary">{dashT('dailyProgress.title')}</h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-secondary-content">
                      <span>{dashT('dailyProgress.target')}</span>
                      <span>{dashT('dailyProgress.progress')}</span>
                    </div>
                    <progress className="progress progress-secondary" value="59" max="100"></progress>
                    <div className="flex justify-between text-sm opacity-70 text-secondary-content">
                      <span>{dashT('dailyProgress.endOfDay')}</span>
                      <span>{dashT('dailyProgress.remaining')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activities */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-secondary">{dashT('recentActivities.title')}</h2>
                  <ul className="timeline timeline-vertical text-base-content">
                    <li>
                      <div className="timeline-start">13:22</div>
                      <div className="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-success"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      </div>
                      <div className="timeline-end timeline-box bg-success/10 border-success/20">{dashT('recentActivities.activities.export')}</div>
                    </li>
                    <li>
                      <div className="timeline-start">11:45</div>
                      <div className="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-info"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      </div>
                      <div className="timeline-end timeline-box bg-info/10 border-info/20">{dashT('recentActivities.activities.modelUpdate')}</div>
                    </li>
                    <li>
                      <div className="timeline-start">09:30</div>
                      <div className="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-warning"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      </div>
                      <div className="timeline-end timeline-box bg-warning/10 border-warning/20">{dashT('recentActivities.activities.apiDisconnect')}</div>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {activeTab !== "dashboard" && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-secondary">{navT(activeTab === "llm" ? "llmConfig" : activeTab === "chats" ? "chatIntegration" : activeTab === "reports" ? "reportsExcel" : activeTab === "storage" ? "cloudStorage" : activeTab === "classifier" ? "bertClassifier" : activeTab === "timing" ? "taskTiming" : activeTab === "logs" ? "logs" : activeTab === "users" ? "userManagement" : "settings")}</h2>
                <p className="py-12 text-center text-base-content/70">{dashT('underDevelopment')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-10">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="menu p-4 w-80 min-h-full bg-base-100 text-base-content gap-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="avatar">
              <div className="w-12 rounded-full bg-primary/10 p-1">
                <Image src="/next.svg" alt="Logo" width={48} height={48} className="dark:invert" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-xl">{commonT('appName')}</h2>
              <p className="text-xs opacity-60">{commonT('subtitle')}</p>
            </div>
          </div>
          <div className="divider"></div>
          <ul className="space-y-2">
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "dashboard" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("dashboard")}>
                <Home size={20} />
                <span className="ml-3">{navT('dashboard')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "llm" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("llm")}>
                <Bot size={20} />
                <span className="ml-3">{navT('llmConfig')}</span>
                <span className="badge badge-sm badge-secondary ml-auto">{navT('api')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "chats" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("chats")}>
                <MessageSquare size={20} />
                <span className="ml-3">{navT('chatIntegration')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "reports" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("reports")}>
                <FileSpreadsheet size={20} />
                <span className="ml-3">{navT('reportsExcel')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "storage" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("storage")}>
                <Cloud size={20} />
                <span className="ml-3">{navT('cloudStorage')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "classifier" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("classifier")}>
                <Database size={20} />
                <span className="ml-3">{navT('bertClassifier')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "timing" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("timing")}>
                <Clock size={20} />
                <span className="ml-3">{navT('taskTiming')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "logs" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("logs")}>
                <Activity size={20} />
                <span className="ml-3">{navT('logs')}</span>
                <div className="badge badge-sm badge-error ml-auto">5</div>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "users" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("users")}>
                <Users size={20} />
                <span className="ml-3">{navT('userManagement')}</span>
              </button>
            </li>
            <li>
              <button
                className={`flex items-center p-2 ${activeTab === "settings" ? "bg-primary text-primary-content" : "hover:bg-base-200"} rounded-lg`}
                onClick={() => setActiveTab("settings")}>
                <Settings size={20} />
                <span className="ml-3">{navT('settings')}</span>
              </button>
            </li>
          </ul>
          <div className="divider"></div>
          <LocaleSwitcher />
          <div className="alert bg-warning/20 text-base-content border-warning/30 shadow-lg">
            <AlertCircle className="text-warning" />
            <div>
              <h3 className="font-bold">{noticeT('title')}</h3>
              <div className="text-xs">{noticeT('maintenance')}</div>
            </div>
          </div>
          <div className="mt-auto text-center text-xs opacity-60 py-4">
            {commonT('version')}
          </div>
        </div>
      </div>
    </div>
  );
}