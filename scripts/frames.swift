// Stills from the app's Main film, for the landing page.
//   swift scripts/frames.swift <video> <outdir> <sec> [<sec> ...]
import AVFoundation
import AppKit

let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero
gen.maximumSize = CGSize(width: 1280, height: 1280)
for s in a.dropFirst(3) {
  let t = CMTime(seconds: Double(s)!, preferredTimescale: 600)
  guard let cg = try? gen.copyCGImage(at: t, actualTime: nil) else { print("yok: \(s)"); continue }
  let rep = NSBitmapImageRep(cgImage: cg)
  let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.78])!
  let out = "\(a[2])/film-\(s).jpg"
  try! data.write(to: URL(fileURLWithPath: out))
  print(out)
}
